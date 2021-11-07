import {query, where} from "firebase/firestore";
import {Queue, QueueItem, QueueSection} from "../models";
import {AppBar, TableCell, TableRow, Toolbar, Typography} from "@mui/material";
import {QueueTableRowsGrouped} from "./QueueTableRowsGrouped";
import React, {ReactElement, useState} from "react";
import {makeGroupConfig, QueueTableGroupConfig} from "./QueueTableGroupConfig";
import {QueueItemTableConfig} from "./QueueTable";

export interface QueueSectionRowsProps {
  queue: Queue,
  tableConfig: QueueItemTableConfig[],
}

export function QueueTableRows({queue, tableConfig}: QueueSectionRowsProps) {
  const sections = queue.sections || [];
  const rows: ReactElement[] = [];
  const [groupConfig, setGroupConfig] = useState(makeGroupConfig(sections));

  const handleChangeGroupConfig = (section: QueueSection, groupBy: keyof QueueItem) => {
    setGroupConfig({
      ...groupConfig,
      [section.name]: groupBy
    });
  };

  sections.forEach((section) => {
    const colRef = query(
      QueueItem.collectionRef(queue.id),
      where("active", "==", true),
      where("section", "==", section.name),
    );
    rows.push(
      <TableRow key={section.name}>
        <TableCell padding="none" colSpan={tableConfig.length}>
          <AppBar position="relative">
            <Toolbar variant="dense"
                     className="d-flex flex-row justify-content-between">
              <Typography variant="h6" color="inherit"
                          component="div">{section.name}</Typography>

              <div className="d-flex flex-row align-items-center">
                <Typography variant={"caption"} color="inherit"
                            component="div">{groupConfig[section.name]}&nbsp; |</Typography>
                <QueueTableGroupConfig config={groupConfig} section={section}
                                       onChange={handleChangeGroupConfig}/>
              </div>
            </Toolbar>
          </AppBar>
        </TableCell>
      </TableRow>
    );

    rows.push(
      <QueueTableRowsGrouped key={section.name + "-group"} queue={queue}
                             collectionRef={colRef}
                             groupBy={groupConfig[section.name]}
                             tableConfig={tableConfig}/>
    );
  });

  return <>{rows}</>;
}