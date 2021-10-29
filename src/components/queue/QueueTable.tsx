import { DocumentSnapshot } from "firebase/firestore";
import { Queue, QueueItem } from "./models";
import { Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material";
import React, { ReactElement } from "react";
import { QueueTableRows } from "./QueueTableRows";
import { UserProxy } from "../auth/models";

export interface QueueSectionsProps {
  queue: DocumentSnapshot<Queue>
}

const userProxyTransformer = (value: any) => {
  const user = value ? value as UserProxy : undefined
  return user?.displayName || user?.email || '-'
}

export interface QueueItemTableConfig {
  header: string,
  field: keyof QueueItem,
  hide?: boolean,
  defaultValue?: string,
  transformer?: (value: any, field: keyof QueueItem, row: QueueItem) => string | ReactElement,
}

export function QueueTable({queue}: QueueSectionsProps) {
  let tableConfig: QueueItemTableConfig[] = [
    {header: 'Priority', field: 'priority', defaultValue: '-'},
    {header: 'Developer', field: 'developer', transformer: userProxyTransformer},
    {header: 'Jira Ticket', field: 'ticketNumber', defaultValue: '-'},
    {header: 'Based On', field: 'basedOnVersion', defaultValue: '-'},
    {header: 'Status', field: 'status'},
    {
      header: 'MRs', field: 'mrLink',
      transformer: (value, field, row) => {
        return (
          <div>
            {row.mrLink && (
              <Tooltip title={row.mrLink}>
                <Link onClick={(e) => e.stopPropagation()} target="_blank" href={row.mrLink}>Finie {row.mrId('mrLink')}</Link>
              </Tooltip>
            )}
            {row.mrLink && row.mrLink2 && ', '}
            {row.mrLink2 && (
              <Tooltip title={row.mrLink2}>
                <Link onClick={(e) => e.stopPropagation()} target="_blank" href={row.mrLink2}>Scribe {row.mrId('mrLink2')}</Link>
              </Tooltip>
            )}
            {!(row.mrLink || row.mrLink2) && '-'}
          </div>
        )
      }
    },
    {header: 'Type', field: 'type', transformer: (value) => value ? value.join(', ') : '-'},
    {header: 'Description', field: 'description', defaultValue: '-'},
    {header: 'Jira Priority', field: 'jiraPriority'},
    {header: 'Reviewer', field: 'reviewer', transformer: userProxyTransformer},
    {header: 'Client', field: 'client'},
  ]
  tableConfig = tableConfig.filter(col => !col.hide)

  return (
    <div className="mb-5">
      <TableContainer>
        <Table size="small" stickyHeader aria-label="queue item table grouped by reviewer">
          <TableHead>
            <TableRow>
              {tableConfig.map((col) => <TableCell key={col.header}><b>{col.header}</b></TableCell>)}
            </TableRow>
          </TableHead>

          <TableBody>
            <QueueTableRows queue={queue} tableConfig={tableConfig} />
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}