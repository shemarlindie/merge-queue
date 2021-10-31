import { Link as RouterLink, useParams } from "react-router-dom";
import { LayoutBreadcrumbs } from "../layout/LayoutBreadcrumbs";
import { CircularProgress, Link, Typography } from "@mui/material";
import { useDocument } from "react-firebase9-hooks/firestore";
import { Queue } from "./models";
import { QueueManageHeader } from "./QueueManageHeader";
import { QueueTable } from "./QueueTable";

export function QueueManage() {
  const params = useParams()
  const queueId = params.queueId as string || ''

  const [doc, docLoading, docError] = useDocument(Queue.documentRef(queueId))
  const queue = doc?.data()

  return (
    <div>
      <LayoutBreadcrumbs>
        <Link
          component={RouterLink}
          underline="hover"
          color="inherit"
          to="/queues">
          Queues
        </Link>
        <Typography color="text.primary">{queue?.name || queueId}</Typography>
      </LayoutBreadcrumbs>

      {!docLoading && doc && queue && (
        <QueueManageHeader doc={doc}/>
      )}

      <div>
        {docError && (
          <div className="p-3">
            <Typography>Error loading queue: <span>{docError}</span></Typography>
          </div>
        )}

        {docLoading && (
          <div className="text-center p-3">
            <CircularProgress thickness={1}/>
          </div>
        )}

        {!docLoading && !queue && (
          <div className="text-center p-3">
            <Typography>Queue not found.</Typography>
          </div>
        )}
      </div>

      {!docLoading && doc && queue && <QueueTable queue={doc}/>}
    </div>
  )
}