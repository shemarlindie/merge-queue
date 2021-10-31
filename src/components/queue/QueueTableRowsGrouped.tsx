import {CollectionReference, Query} from "firebase/firestore";
import {useCollection} from "react-firebase9-hooks/firestore";
import React, {ReactElement, useMemo, useState} from "react";
import {groupList} from "../../utils";
import {jiraPriorityList, Queue, QueueItem, statusList} from "./models";
import {TableCell, TableRow} from "@mui/material";
import {QueueItemEditDialog} from "./QueueItemEditDialog";
import {QueueItemTableConfig} from "./QueueTable";
import {QueueTableRowMoreMenu} from "./QueueTableRowMoreMenu";

export interface GroupedQueueItemsProps {
  queue: Queue,
  collectionRef: CollectionReference<QueueItem> | Query<QueueItem>,
  groupBy: keyof QueueItem,
  tableConfig: QueueItemTableConfig[],
}

const ungroupedName = "Unassigned";

const userProxyGroupCompareFn = (a: string, b: string) => a === b ? 0 : a === ungroupedName ? -1 : b === ungroupedName ? 1 : a < b ? -1 : 1;

const groupCompareFns: Partial<Record<keyof QueueItem, (a: string, b: string) => number>> = {
  jiraPriority: (a: string, b: string) => jiraPriorityList.indexOf(b) - jiraPriorityList.indexOf(a),
  status: (a: string, b: string) => statusList.indexOf(b) - statusList.indexOf(a),
  reviewer: userProxyGroupCompareFn,
  developer: userProxyGroupCompareFn,
  qaAssignee: userProxyGroupCompareFn,
};

export function QueueTableRowsGrouped({queue, collectionRef, groupBy, tableConfig}: GroupedQueueItemsProps) {
  const [itemCollection] = useCollection(collectionRef);
  const items = useMemo(() => itemCollection ? itemCollection.docs.map(doc => doc.data()) : [], [itemCollection]);
  const groupedItems = useMemo(
    () => {
      const grouped = groupList<QueueItem>(items, QueueItem.makeGroupByValueConverter(groupBy), ungroupedName);
      for (const key in grouped) {
        grouped[key] = grouped[key].sort((a, b) => a.createdTimestamp - b.createdTimestamp);
      }
      return grouped;
    },
    [groupBy, items]
  );
  const sortedGroupKeys = Object.keys(groupedItems).sort(groupCompareFns[groupBy]);

  const [showQueueItemEditDialog, setShowQueueItemEditDialog] = useState(false);
  const [selectedQueueItem, setSelectedQueueItem] = useState<QueueItem | undefined>(undefined);
  const handleQueueItemEditDialogOpen = (task: QueueItem) => {
    setSelectedQueueItem(task);
    setShowQueueItemEditDialog(true);
  };

  const handleQueueItemEditDialogClose = () => {
    setShowQueueItemEditDialog(false);
    setSelectedQueueItem(undefined);
  };

  return (
    <>
      {itemCollection && items && groupedItems && (
        sortedGroupKeys.map((group) => {
          const elms: ReactElement[] = [];
          if (groupedItems[group].length) {
            elms.push(
              <TableRow key={group} className="bg">
                <TableCell valign="bottom" component="th" colSpan={tableConfig.length}>
                  <b>{group}</b>
                </TableCell>
              </TableRow>
            );
          }

          for (const row of groupedItems[group]) {
            elms.push(
              <TableRow key={row.id} hover onClick={() => handleQueueItemEditDialogOpen(row)}>
                {tableConfig.filter(el => !!el.field).map((col) => {
                  const transformer = col.transformer;
                  let fieldValue: any = transformer ? transformer(row[col.field!], col.field!, row) : row[col.field!];
                  fieldValue = [null, undefined, ""].includes(fieldValue) ? col.defaultValue : fieldValue;
                  return (
                    <TableCell key={col.field}>{fieldValue}</TableCell>
                  );
                })}
                <TableCell>
                  <QueueTableRowMoreMenu queue={queue} task={row} onEdit={handleQueueItemEditDialogOpen}/>
                </TableCell>
              </TableRow>
            );
          }

          if (!items.length) {
            elms.push(
              <TableRow key="no-tasks">
                <TableCell colSpan={tableConfig.length}>
                  <div className="text-center">No tasks.</div>
                </TableCell>
              </TableRow>
            );
          }

          return elms;
        })
      )}

      {showQueueItemEditDialog && selectedQueueItem && (
        <QueueItemEditDialog
          open={showQueueItemEditDialog}
          queue={queue}
          task={selectedQueueItem}
          onClose={handleQueueItemEditDialogClose}/>
      )}
    </>
  );
}