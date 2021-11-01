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
  useMediaQuery,
  useTheme
} from "@mui/material";
import {doc as docRef, serverTimestamp, setDoc, updateDoc} from "firebase/firestore";
import React, {useMemo, useState} from "react";
import {useFormik} from "formik";
import {jiraPriorityList, Queue, QueueItem, queueItemValidationSchema, statusList, typeList} from "./models";
import {LoadingButton} from "@mui/lab";
import {auth, firestore} from "../../firebase/firebase-config";
import {useSnackbar} from "notistack";
import {MdClose} from "react-icons/all";
import {makeUserProxy, makeUserProxyList} from "../auth/utils";
import {v4 as uuid4} from "uuid";

export interface QueueItemEditDialogProps {
  open: boolean;
  onClose: () => void;
  queue: Queue;
  task?: QueueItem;
}

export function QueueItemEditDialog({onClose, open, queue, task}: QueueItemEditDialogProps) {
  const [saving, setSaving] = useState(false);
  const {enqueueSnackbar} = useSnackbar();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const members = useMemo(() => makeUserProxyList(queue?.members), [queue]);
  const clients = queue?.clients || [];
  const sections = queue?.sections.map(el => el.name) || [];

  const handleCancel = () => {
    onClose();
  };

  const handleSave = async (values: any) => {
    console.log("form data", values);
    setSaving(true);
    try {
      if (task) {
        await updateDoc(task.documentRef(), {
          ...values,
          dateUpdated: serverTimestamp(),
          updatedBy: auth.currentUser ? docRef(firestore, "users", auth.currentUser.uid) : null
        });
      } else {
        const id = uuid4();
        await setDoc(docRef(QueueItem.collectionRef(queue.id), id), {
          ...values,
          id: id,
          dateCreated: serverTimestamp(),
          createdBy: auth.currentUser ? docRef(firestore, "users", auth.currentUser.uid) : null
        });
      }
      enqueueSnackbar("Task saved.", {
        autoHideDuration: 5000, role: "alert"
      });
      onClose();
    } catch (e: any) {
      console.error("Error saving task", e);
      enqueueSnackbar("Unable to save task.", {
        autoHideDuration: 5000, variant: "error", role: "alert"
      });
    }

    setSaving(false);
  };

  const formik = useFormik({
    initialValues: task || {
      queueId: queue.id,
      section: sections[sections.length - 1] || "",
      description: "",
      developer: makeUserProxy(auth.currentUser),
      reviewer: null,
      qaAssignee: null,
      ticketNumber: "",
      basedOnVersion: "",
      mrLink: "",
      mrLink2: "",
      status: statusList[0],
      type: [typeList[0]],
      jiraPriority: jiraPriorityList[0],
      priority: "",
      client: clients.length ? clients[0] : "",
      notes: "",
      active: true,
    },
    validationSchema: queueItemValidationSchema,
    onSubmit: handleSave,
  });

  return (
    <Dialog onClose={handleCancel} open={open} fullScreen={fullScreen} maxWidth="md" fullWidth keepMounted>
      <form onSubmit={formik.handleSubmit} autoComplete="off" noValidate>
        <DialogTitle className="d-flex flex-row justify-content-between align-items-center">
          <span>{task ? "Edit" : "Add"} Task</span>
          <IconButton onClick={handleCancel}><MdClose/></IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {/*{JSON.stringify(formik.errors)}*/}
          </DialogContentText>

          <div className="d-flex flex-column justify-content-start flex-md-row justify-content-md-evenly">
            <Autocomplete
              className="me-md-3"
              options={sections}
              openOnFocus
              autoHighlight
              disableClearable
              fullWidth
              renderInput={(params) => (
                <TextField
                  {...params}
                  name="section"
                  label="Section"
                  placeholder="Select section..."
                  margin="normal"
                />
              )}
              value={formik.values.section}
              onChange={(e, val) => formik.setFieldValue("section", val)}
            />

            <Autocomplete
              className="me-md-3"
              options={statusList}
              openOnFocus
              autoHighlight
              disableClearable
              fullWidth
              renderInput={(params) => (
                <TextField
                  {...params}
                  name="status"
                  label="Status"
                  placeholder="Select status..."
                  margin="normal"
                />
              )}
              value={formik.values.status}
              onChange={(e, val) => formik.setFieldValue("status", val)}
            />

            <TextField
              type="number"
              label="Priority"
              variant="outlined"
              margin="normal"
              fullWidth
              error={!!formik.errors.priority}
              helperText={formik.errors.priority}
              {...formik.getFieldProps("priority")}
            />
          </div>

          <div className="d-flex flex-column justify-content-start flex-md-row justify-content-md-evenly">
            <TextField
              className="me-md-3"
              type="text"
              label="Jira Ticket"
              variant="outlined"
              margin="normal"
              fullWidth
              error={!!formik.errors.ticketNumber}
              helperText={formik.errors.ticketNumber}
              {...formik.getFieldProps("ticketNumber")}
            />

            <Autocomplete
              className="me-md-3"
              options={jiraPriorityList}
              openOnFocus
              autoHighlight
              disableClearable
              fullWidth
              renderInput={(params) => (
                <TextField
                  {...params}
                  name="jiraPriority"
                  label="Jira Priority"
                  placeholder="Select Jira Priority..."
                  margin="normal"
                />
              )}
              value={formik.values.jiraPriority}
              onChange={(e, val) => formik.setFieldValue("jiraPriority", val)}
            />

            <Autocomplete
              options={clients}
              openOnFocus
              autoHighlight
              disableClearable
              fullWidth
              renderInput={(params) => (
                <TextField
                  {...params}
                  name="client"
                  label="Client"
                  placeholder="Select Client..."
                  margin="normal"
                />
              )}
              value={formik.values.client}
              onChange={(e, val) => formik.setFieldValue("client", val)}
            />
          </div>

          <div className="d-flex flex-column justify-content-start flex-md-row">
            <TextField
              className="me-md-3"
              type="url"
              label="MR Link"
              variant="outlined"
              margin="normal"
              fullWidth
              error={!!formik.errors.mrLink}
              helperText={formik.errors.mrLink}
              {...formik.getFieldProps("mrLink")}
            />

            <TextField
              className="me-md-3"
              type="url"
              label="Scribe MR Link"
              variant="outlined"
              margin="normal"
              fullWidth
              error={!!formik.errors.mrLink2}
              helperText={formik.errors.mrLink2}
              {...formik.getFieldProps("mrLink2")}
            />

            <TextField
              style={{minWidth: "100px"}}
              type="text"
              label="Based On"
              variant="outlined"
              margin="normal"
              error={!!formik.errors.basedOnVersion}
              helperText={formik.errors.basedOnVersion}
              {...formik.getFieldProps("basedOnVersion")}
            />
          </div>

          <Autocomplete
            options={typeList}
            multiple
            filterSelectedOptions
            disableCloseOnSelect
            openOnFocus
            autoHighlight
            fullWidth
            renderInput={(params) => (
              <TextField
                {...params}
                name="type"
                label="Type"
                placeholder="Search and add multiple types..."
                margin="normal"
              />
            )}
            value={formik.values.type}
            onChange={(e, val) => formik.setFieldValue("type", val)}
          />

          <TextField
            type="text"
            label="Description"
            variant="outlined"
            margin="normal"
            rows={2}
            required
            multiline
            fullWidth
            error={!!formik.errors.description}
            helperText={formik.errors.description || " "}
            {...formik.getFieldProps("description")}
          />

          <div className="d-flex flex-column justify-content-start flex-md-row justify-content-md-evenly">
            <Autocomplete
              className="me-md-3"
              options={members}
              getOptionLabel={(option) => option.displayName || ""}
              openOnFocus
              autoHighlight
              fullWidth
              renderInput={(params) => (
                <TextField
                  {...params}
                  name="developer"
                  label="Developer"
                  placeholder="Search and set developer..."
                  margin="normal"
                />
              )}
              isOptionEqualToValue={(option, value) => option.uid === value.uid}
              value={formik.values.developer}
              onChange={(e, val) => formik.setFieldValue("developer", val)}
            />

            <Autocomplete
              className="me-md-3"
              options={members}
              getOptionLabel={(option) => option.displayName || ""}
              openOnFocus
              autoHighlight
              fullWidth
              renderInput={(params) => (
                <TextField
                  {...params}
                  name="reviewer"
                  label="Reviewer"
                  placeholder="Search and set reviewer..."
                  margin="normal"
                />
              )}
              isOptionEqualToValue={(option, value) => option.uid === value.uid}
              value={formik.values.reviewer}
              onChange={(e, val) => formik.setFieldValue("reviewer", val)}
            />

            <Autocomplete
              options={members}
              getOptionLabel={(option) => option.displayName || ""}
              openOnFocus
              autoHighlight
              fullWidth
              renderInput={(params) => (
                <TextField
                  {...params}
                  name="qaAssignee"
                  label="QA Assignee"
                  placeholder="Search and set QA Assignee..."
                  margin="normal"
                />
              )}
              isOptionEqualToValue={(option, value) => option.uid === value.uid}
              value={formik.values.qaAssignee}
              onChange={(e, val) => formik.setFieldValue("qaAssignee", val)}
            />
          </div>

          <TextField
            type="text"
            label="Notes"
            variant="outlined"
            margin="normal"
            minRows={3}
            maxRows={5}
            multiline
            fullWidth
            error={!!formik.errors.notes}
            helperText={formik.errors.notes}
            {...formik.getFieldProps("notes")}
          />
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