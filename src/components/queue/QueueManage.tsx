import {Link as RouterLink, useParams} from "react-router-dom";
import {LayoutBreadcrumbs} from "../layout/LayoutBreadcrumbs";
import {CircularProgress, Link, Typography} from "@mui/material";
import {useDocumentData} from "react-firebase9-hooks/firestore";
import {Queue} from "./models";
import {QueueManageHeader} from "./QueueManageHeader";
import {QueueTable} from "./QueueTable";

export function QueueManage() {
  const params = useParams();
  const queueId = params.queueId as string || "";

  const [queue, loading, error] = useDocumentData(Queue.documentRef(queueId));

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

      {!loading && queue && (
        <QueueManageHeader queue={queue}/>
      )}

      <div>
        {error && (
          <div className="p-3">
            <Typography>Error loading queue: <span>{error}</span></Typography>
          </div>
        )}

        {loading && (
          <div className="text-center p-3">
            <CircularProgress thickness={1}/>
          </div>
        )}

        {!loading && !queue && (
          <div className="text-center p-3">
            <Typography>Queue not found.</Typography>
          </div>
        )}
      </div>

      {!loading && queue && <QueueTable queue={queue}/>}
    </div>
  );
}