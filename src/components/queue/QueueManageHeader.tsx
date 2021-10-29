import { Queue } from "./models";
import { Button, Typography, useMediaQuery, useTheme } from "@mui/material";
import { MdPostAdd, MdSettings } from "react-icons/all";
import { QueueEditDialog } from "./QueueEditDialog";
import { useState } from "react";
import { DocumentSnapshot } from "firebase/firestore";
import { QueueItemEditDialog } from "./QueueItemEditDialog";

export function QueueManageHeader({doc}: { doc: DocumentSnapshot<Queue> }) {
  const theme = useTheme()
  const screenSm = useMediaQuery(theme.breakpoints.up('sm'))
  const queue = doc.data() as Queue
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showQueueItemEditDialog, setShowQueueItemEditDialog] = useState(false);

  const handleEditDialogOpen = () => {
    setShowEditDialog(true);
  };

  const handleEditDialogClose = () => {
    setShowEditDialog(false);
  };

  const handleQueueItemEditDialogOpen = () => {
    setShowQueueItemEditDialog(true);
  };

  const handleQueueItemEditDialogClose = () => {
    setShowQueueItemEditDialog(false);
  };

  return (
    <div className="border-bottom p-3 d-flex flex-column align-items-stretch flex-sm-row align-items-sm-center">
      <div className="flex-grow-1">
        <Typography variant="h6">{queue.name}</Typography>
        <Typography variant="body2">{queue.description}</Typography>
      </div>

      <div className="mt-3 mt-sm-0 d-flex flex-row justify-content-center">
        <Button
          className="me-2"
          onClick={handleQueueItemEditDialogOpen}
          startIcon={<MdPostAdd/>}
          size={screenSm ? "large" : "medium"}
          variant="outlined">
          Add Task
        </Button>

        <Button
          onClick={handleEditDialogOpen}
          startIcon={<MdSettings/>}
          size={screenSm ? "large" : "medium"}
          variant="outlined">
          Settings
        </Button>
      </div>

      {showEditDialog && <QueueEditDialog open={showEditDialog} doc={doc} onClose={handleEditDialogClose}/>}
      {showQueueItemEditDialog &&
      <QueueItemEditDialog open={showQueueItemEditDialog} queue={doc} onClose={handleQueueItemEditDialogClose}/>}
    </div>
  )
}