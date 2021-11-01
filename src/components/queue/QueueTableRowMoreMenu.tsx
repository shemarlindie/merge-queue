import {Queue, QueueItem} from "./models";
import {MdMoreVert} from "react-icons/all";
import {IconButton, Menu, MenuItem} from "@mui/material";
import React, {useState} from "react";
import {deleteDoc} from "firebase/firestore";
import {useSnackbar} from "notistack";
import {useConfirmDelete} from "../../utils/dialogs";

interface QueueTableRowMoreMenuProps {
  queue: Queue;
  task: QueueItem;
  onEdit?: (task: QueueItem, event: React.UIEvent<HTMLElement>) => void;
}

export function QueueTableRowMoreMenu({queue, task, onEdit}: QueueTableRowMoreMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const confirmDelete = useConfirmDelete();
  const {enqueueSnackbar} = useSnackbar();

  const handleMenu = (event: React.UIEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = (event: React.UIEvent<HTMLElement>) => {
    handleMenuClose();
    if (onEdit) {
      onEdit(task, event);
    }
  };

  const handleDelete = (event: React.UIEvent<HTMLElement>) => {
    handleMenuClose();

    confirmDelete(`${task.ticketNumber ? "The " + task.ticketNumber : "This"} merge task will be deleted. Are you sure?`, "Delete Merge Task")
      .then(() => {
        deleteDoc(task.documentRef())
          .then(() => {
            enqueueSnackbar("Task deleted.");
          })
          .catch((e) => {
            enqueueSnackbar("Error deleting task.", {variant: "error"});
            console.error("Error deleting task.", e);
          });
      })
      .catch(() => true);
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <IconButton onClick={handleMenu}>
        <MdMoreVert/>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}>
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>
    </div>
  );
}