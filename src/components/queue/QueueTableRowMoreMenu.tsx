import {Queue, QueueItem} from "./models";
import {MdMoreVert} from "react-icons/all";
import {IconButton, Menu, MenuItem} from "@mui/material";
import React, {useState} from "react";

interface QueueTableRowMoreMenuProps {
  queue: Queue;
  task: QueueItem;
  onEdit?: (task: QueueItem, event: React.UIEvent<HTMLElement>) => void;
}

export function QueueTableRowMoreMenu({queue, task, onEdit}: QueueTableRowMoreMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.UIEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = (event: React.UIEvent<HTMLElement>) => {
    event.stopPropagation();
    handleMenuClose();
    if (onEdit) {
      onEdit(task, event);
    }
  };

  const handleDelete = (event: React.UIEvent<HTMLElement>) => {
    event.stopPropagation();
    handleMenuClose();
  };

  return (
    <div>
      <IconButton onClick={handleMenu}>
        <MdMoreVert/>
      </IconButton>
      <Menu
        onClick={(e) => e.stopPropagation()}
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