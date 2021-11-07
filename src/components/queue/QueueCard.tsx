import {Queue} from "./models";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  Menu,
  MenuItem,
  Typography
} from "@mui/material";
import {QueueEditDialog} from "./QueueEditDialog";
import React, {useState} from "react";
import {BsThreeDotsVertical, MdDelete, MdEdit} from "react-icons/all";
import {useTruncate} from "../../utils/useTruncate";
import {Link as RouterLink} from "react-router-dom";
import {useConfirmDelete} from "../../utils/dialogs";
import {useSnackbar} from "notistack";
import {QueueService} from "./queue-service";

export function QueueCard({queue}: { queue: Queue }) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const confirmDelete = useConfirmDelete();
  const {enqueueSnackbar} = useSnackbar();

  const handleMenu = (event: React.UIEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    setShowEditDialog(true);
    handleMenuClose();
  };

  const handleEditDialogClose = () => {
    setShowEditDialog(false);
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    confirmDelete(`${queue.name ? "The \"" + queue.name + "\"" : "This"} queue and all tasks will be deleted. Are you sure?`, "Delete Queue")
      .then(() => {
        QueueService.updateQueue(queue, {active: false})
          .then(() => {
            enqueueSnackbar("Queue was queued for deleted.");
          })
          .catch((e) => {
            enqueueSnackbar("Error deleting queue.", {variant: "error"});
            console.error("Error deleting queue.", e);
          });
      })
      .catch(() => true);
  };

  return (
    <Card className="m-2 d-flex flex-column w-100"
          sx={{minWidth: 150, maxWidth: 275, minHeight: 162}}>
      <CardHeader
        action={
          <>
            <IconButton
              aria-label="more options"
              aria-haspopup="true"
              onClick={handleMenu}
            >
              <BsThreeDotsVertical/>
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
              onClose={handleMenuClose}
            >
              <MenuItem
                onClick={handleEditClick}><MdEdit/>&nbsp; Edit</MenuItem>
              <MenuItem
                onClick={handleDeleteClick}><MdDelete/>&nbsp; Delete</MenuItem>
            </Menu>
          </>
        }
        title={useTruncate(queue.name, 15)}
      />
      <CardContent className="flex-grow-1">
        <Typography variant="body2">
          {useTruncate(queue?.description || "", 65)}
        </Typography>
      </CardContent>
      <CardActions
        className="d-flex flex-row justify-content-center justify-content-md-end">
        <Button component={RouterLink} to={`/queues/${queue.id}`}>Manage
          Queue</Button>
      </CardActions>

      {showEditDialog &&
      <QueueEditDialog open={showEditDialog} onClose={handleEditDialogClose}
                       queue={queue}/>}
    </Card>
  );
}