import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import {collection, doc as docRef, serverTimestamp, setDoc, updateDoc} from "firebase/firestore";
import React, {useCallback, useState} from "react";
import {useFormik} from "formik";
import {groupByFields, Queue, queueValidationSchema} from "./models";
import {LoadingButton} from "@mui/lab";
import {auth, firestore} from "../../firebase/firebase-config";
import {useSnackbar} from "notistack";
import {MdClose} from "react-icons/all";
import {useCollectionDataOnce} from "react-firebase9-hooks/firestore";
import {makeUserProxy, makeUserProxyList} from "../auth/utils";
import {DataGrid, GridColDef} from "@mui/x-data-grid";
import {addIndexIds} from "../../utils";
import {v4 as uuid4} from "uuid";

export interface QueueEditDialogProps {
  open: boolean;
  onClose: () => void;
  queue?: Queue;
}

export function QueueEditDialog({onClose, open, queue}: QueueEditDialogProps) {
  const [saving, setSaving] = useState(false);
  const {enqueueSnackbar} = useSnackbar();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [userList] = useCollectionDataOnce(collection(firestore, "users"));
  const users = makeUserProxyList(userList);
  const emptyOptions: string[] = [];

  const handleCancel = () => {
    onClose();
  };

  const handleSave = async (values: any) => {
    console.log("form data", values);
    setSaving(true);
    try {
      if (queue) {
        const data = {
          ...values,
          dateUpdated: serverTimestamp(),
          updatedBy: auth.currentUser ? docRef(firestore, "users", auth.currentUser.uid) : null
        };
        await updateDoc(queue.documentRef(), data);
      } else {
        const id = uuid4();
        const data = {
          ...values,
          id: id,
          dateCreated: serverTimestamp(),
          createdBy: auth.currentUser ? docRef(firestore, "users", auth.currentUser.uid) : null
        };
        await setDoc(docRef(Queue.collectionRef(), id), data);
      }
      enqueueSnackbar("Queue saved.", {
        autoHideDuration: 5000, role: "alert"
      });
      onClose();
    } catch (e: any) {
      console.error("Error saving queue", e);
      enqueueSnackbar("Unable to save queue.", {
        autoHideDuration: 5000, variant: "error", role: "alert"
      });
    }

    setSaving(false);
  };

  const initialValues = queue || {
    name: "",
    description: "",
    clients: [],
    watchers: [],
    sections: [],
    members: auth.currentUser ? [makeUserProxy(auth.currentUser)] : [],
    active: true,
  };
  initialValues.sections = addIndexIds(initialValues.sections);
  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: queueValidationSchema,
    onSubmit: handleSave,
  });

  const handleSectionRowEdit = useCallback((params) => {
    console.log("handleSectionRowEdit", params);
    const updatedSections = formik.values.sections.map((el: any) => {
      if (el.id === params.id) {
        return params.row;
      }
      return el;
    });
    formik.setFieldValue("sections", updatedSections);
  }, [formik]);

  const handleSectionRowCommit = useCallback((id, e) => {
    console.log("handleSectionRowCommit id", id);
  }, []);

  const handleAddSectionRow = useCallback(() => {
    const updatedSections = formik.values.sections.map((el: any) => el);
    updatedSections.push({id: updatedSections.length, groupBy: "reviewer"});
    formik.setFieldValue("sections", updatedSections);
  }, [formik]);

  const handleRemoveSectionRow = useCallback((id) => {
    const updatedSections = formik.values.sections.filter((el: any) => el.id !== id);
    formik.setFieldValue("sections", updatedSections);
  }, [formik]);

  const sectionGridConfig: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      minWidth: 150,
      flex: .45,
      editable: true,
      sortable: false,
    },
    {
      field: "groupBy",
      headerName: "Group By",
      minWidth: 140,
      flex: .45,
      editable: true,
      sortable: false,
      type: "singleSelect",
      valueOptions: groupByFields,
    },
    {
      field: "",
      headerName: "",
      minWidth: 40,
      flex: .1,
      sortable: false,
      type: "actions",
      renderCell: (params) => {
        // const rowMode = params.api.getRowMode(params.id)
        // const oppositeRowMode = rowMode === 'edit' ? 'view' : 'edit'
        return (
          <div>
            {/*<IconButton onClick={(e) => {*/}
            {/*  if (rowMode === 'edit') {*/}
            {/*    params.api.commitRowChange(params.id, e)*/}
            {/*  }*/}
            {/*  params.api.setRowMode(params.id, oppositeRowMode)*/}
            {/*}}>*/}
            {/*  {rowMode === 'edit' ? <MdCheck/> : <MdEdit/>}*/}
            {/*</IconButton>*/}
            <IconButton onClick={() => handleRemoveSectionRow(params.id)}>
              <MdClose/>
            </IconButton>
          </div>
        );
      }
    }
  ];

  return (
    <Dialog
      onClose={handleCancel}
      open={open}
      fullScreen={fullScreen}
      maxWidth="md"
      fullWidth
      keepMounted>
      <form onSubmit={formik.handleSubmit} autoComplete="off" noValidate>
        <DialogTitle className="d-flex flex-row justify-content-between align-items-center">
          <span>{queue ? "Edit" : "Create"} Queue</span>
          <IconButton onClick={handleCancel}><MdClose/></IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
          </DialogContentText>

          <TextField
            type="text"
            label="Name"
            variant="outlined"
            margin="normal"
            fullWidth
            autoFocus
            required
            error={!!formik.errors.name}
            helperText={formik.errors.name}
            {...formik.getFieldProps("name")}
          />

          <TextField
            type="text"
            label="Description"
            variant="outlined"
            margin="normal"
            rows={2}
            multiline
            fullWidth
            error={!!formik.errors.description}
            helperText={formik.errors.description}
            {...formik.getFieldProps("description")}
          />

          <Autocomplete
            options={users}
            getOptionLabel={(option) => option.displayName || ""}
            multiple
            filterSelectedOptions
            disableCloseOnSelect
            disableClearable
            openOnFocus
            autoHighlight
            renderInput={(params) => (
              <TextField
                {...params}
                name="members"
                label="Members"
                placeholder="Search and add multiple members..."
                margin="normal"
                helperText="Members can be assigned tasks in queue."
              />
            )}
            isOptionEqualToValue={(option, value) => option.uid === value.uid}
            value={formik.values.members}
            onChange={(e, val) => formik.setFieldValue("members", val)}
          />

          <Autocomplete
            options={users}
            getOptionLabel={(option) => option.displayName || ""}
            multiple
            filterSelectedOptions
            disableCloseOnSelect
            disableClearable
            openOnFocus
            autoHighlight
            renderInput={(params) => (
              <TextField
                {...params}
                name="watchers"
                label="Watchers"
                placeholder="Search and add multiple watchers..."
                margin="normal"
                helperText="Watchers receive notifications for all tasks (whether they are assigned or not)."
              />
            )}
            isOptionEqualToValue={(option, value) => option.uid === value.uid}
            value={formik.values.watchers}
            onChange={(e, val) => formik.setFieldValue("watchers", val)}
          />

          <Autocomplete
            options={emptyOptions}
            multiple
            disableClearable
            freeSolo
            renderInput={(params) => (
              <TextField
                {...params}
                name="clients"
                label="Clients"
                placeholder="Type a name then press ENTER to add..."
                margin="normal"
                helperText="A list of clients available for selection in tasks."
              />
            )}
            value={formik.values.clients}
            onChange={(e, val) => formik.setFieldValue("clients", val)}
          />

          <div className="mt-1">
            <div className="d-flex flex-row justify-content-between align-items-center">
              <Typography variant="overline">Sections</Typography>
              <Button onClick={handleAddSectionRow}>Add Section</Button>
            </div>
            <DataGrid
              rows={formik.values.sections}
              columns={sectionGridConfig}
              editMode="row"
              onRowEditStop={handleSectionRowEdit}
              onRowEditCommit={handleSectionRowCommit}
              autoHeight
              hideFooter
              disableColumnMenu
              disableSelectionOnClick
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Close</Button>
          <LoadingButton
            loading={saving}
            type="submit"
            variant="contained"
            disabled={saving || !formik.isValid}
          >
            Save
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}