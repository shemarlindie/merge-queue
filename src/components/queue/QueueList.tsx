import {useCollectionData} from "react-firebase9-hooks/firestore";
import {QueueCard} from "./QueueCard";
import {Button, CircularProgress, Typography} from "@mui/material";
import {BsPlus} from "react-icons/all";
import {useState} from "react";
import {QueueEditDialog} from "./QueueEditDialog";
import {LayoutBreadcrumbs} from "../layout/LayoutBreadcrumbs";
import {Queue} from "./models";
import {query, where} from "firebase/firestore";

export function QueueList() {
  const [queueList, loading, error] = useCollectionData(query(Queue.collectionRef(), where("active", "==", true)));
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleEditDialogOpen = () => {
    setShowEditDialog(true);
  };

  const handleEditDialogClose = () => {
    setShowEditDialog(false);
  };

  return (
    <div>
      <LayoutBreadcrumbs>
        <Typography color="text.primary">Queues</Typography>
      </LayoutBreadcrumbs>

      <div className="bg p-3">
        <div className="d-flex flex-row justify-content-center mb-3 mt-1">
          <Button
            disabled={loading}
            variant="contained"
            size="large"
            startIcon={<BsPlus size="40"/>}
            onClick={handleEditDialogOpen}>
            Create Queue
          </Button>

          {showEditDialog && <QueueEditDialog open={showEditDialog}
                                              onClose={handleEditDialogClose}/>}
        </div>

        {error && (
          <div>Error loading queues: <span
            className="text-danger">{error}</span></div>
        )}

        {loading && (
          <div className="text-center">
            <CircularProgress thickness={1}/>
          </div>
        )}
        {!loading && queueList && (
          <div
            className="d-flex flex-sm-wrap flex-sm-row justify-content-sm-center align-items-sm-start flex-nowrap flex-column justify-content-start align-items-center">
            {queueList.map((queue) => <QueueCard key={queue.id}
                                                 queue={queue}/>)}
          </div>
        )}
        {!loading && !queueList && (
          <div className="text-center">No queues yet.</div>
        )}
      </div>
    </div>
  );
}