import * as functions from "firebase-functions";
import * as path from "path";
import * as Email from "email-templates";
import * as admin from "firebase-admin";
import * as sgMail from "@sendgrid/mail";
import {
  stringComparer,
  stringFormatter,
  typeComparer,
  typeFormatter,
  userComparer,
  userFormatter,
} from "./utils";
import {
  ChangeSummary,
  DocRef,
  FormattedChanges,
  Formatter,
  Optional,
  TaskChange,
  WatchedFields,
} from "./types";
import {Queue, QueueItem, UserProxy} from "./models";

admin.initializeApp();

sgMail.setApiKey(functions.config().sendgrid.key);

const notificationsEnabled = functions.config().app.notifications === "true";

const stringConfig = {comparer: stringComparer, formatter: stringFormatter};
const userConfig = {comparer: userComparer, formatter: userFormatter};
const watchedFields: Partial<WatchedFields> = {
  basedOnVersion: stringConfig,
  description: stringConfig,
  developer: userConfig,
  client: stringConfig,
  jiraPriority: stringConfig,
  mrLink: stringConfig,
  mrLink2: stringConfig,
  // priority: stringConfig,
  qaAssignee: userConfig,
  reviewer: userConfig,
  section: stringConfig,
  status: stringConfig,
  ticketNumber: stringConfig,
  type: {comparer: typeComparer, formatter: typeFormatter},
};

/**
 * Gets the user who made the change from audit data stored in the model.
 * Works for create and update.
 * undefined if the user could not be determined.
 *
 * This is a workaround since firestore triggers do not currently support
 * context.auth (like realtime database does)
 * @param {TaskChange} change
 * @return {Promise<Optional<UserProxy>>}
 */
const getChangeUser = async (
  change: TaskChange
) => {
  const after = change.after.data();
  const userRef: Optional<DocRef> = (
    after?.updatedBy || after?.createdBy
  );
  const user = userRef ? await userRef.get() : undefined;
  return user && user.data() ? user.data() as UserProxy : undefined;
};

const getLatestChange = (change: TaskChange) => {
  return (change.after.data() || change.before.data()) as QueueItem;
};

const getChangeType = (change: TaskChange) => {
  const created = !change.before.data();
  const deleted = !change.after.data();
  const updated = !!(change.before.data() && change.after.data());

  return {created, updated, deleted};
};

const computeChangedFields = (change: TaskChange) => {
  let changed: (keyof WatchedFields)[];
  const before = change.before.data();
  const after = change.after.data();
  const fields = Object.keys(watchedFields) as (keyof WatchedFields)[];

  // if we don't have before AND after an item was either created or deleted
  // which means all fields changed
  if (!(before && after)) {
    changed = fields;
  } else { // check for changed fields
    changed = [];
    for (const field of fields) {
      const compare = watchedFields[field]?.comparer;
      if (compare && !compare(before[field], after[field])) {
        changed.push(field);
      }
    }
  }
  return changed;
};

const getChangeSummary = async (change: TaskChange) => {
  const fields = computeChangedFields(change);

  if (fields.length) {
    const changeType = getChangeType(change);
    const latest = getLatestChange(change);
    const queue = await admin.firestore()
      .doc(`queues/${latest?.queueId}`).get();
    const user = await getChangeUser(change);
    const changeSummary: ChangeSummary = {
      user,
      fields,
      changeType,
      queue: queue.data() ? queue.data() as Queue : null,
      latest,
      before: {},
      after: {},
    };
    for (const key of fields) {
      changeSummary.before[key] = change.before.get(key);
      changeSummary.after[key] = change.after.get(key);
    }

    return changeSummary;
  }

  return null;
};

const formatChanges = (changeSummary: ChangeSummary) => {
  const formatted: FormattedChanges = {before: {}, after: {}};

  for (const key of changeSummary.fields) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const format: Optional<Formatter<any>> = watchedFields[key]?.formatter;
    if (format) {
      formatted["before"][key] = format(changeSummary.before[key]);
      formatted["after"][key] = format(changeSummary.after[key]);
    }
  }

  return formatted;
};

const prepareEmailBody = async (changeSummary: ChangeSummary) => {
  const diff = formatChanges(changeSummary);
  const tmplDir = path.join(__dirname, "..", "src", "templates");
  const body = {html: "", text: ""};
  const email = new Email({
    juiceResources: {
      webResources: {
        relativeTo: tmplDir,
      },
    },
  });
  body.html = await email.render(
    path.join(tmplDir, "queue-item-change"), {changeSummary, diff}
  );
  body.text = await email.render(
    path.join(tmplDir, "queue-item-change-text"), {changeSummary, diff}
  );

  return body;
};

const getRecipients = async (
  changeSummary: ChangeSummary, change: TaskChange
) => {
  const recipientFields = ["developer", "reviewer", "qaAssignee"];
  const recipients = new Set<string>();

  // get recipients from changed task
  const after = change.after.data();
  const before = change.before.data();
  const userEmail = changeSummary.user && changeSummary.user.email;
  for (const field of recipientFields) {
    if (after) {
      if (after[field] && after[field].email) {
        recipients.add(after[field].email);
      }
    }
    if (before) {
      if (before[field] && before[field].email) {
        recipients.add(before[field].email);
      }
    }
  }
  console.log(`Found ${recipients.size} recipient(s) in task.`);

  // get recipients from queue watchers
  const watchers = changeSummary.queue?.watchers || [];
  for (const user of watchers) {
    if (user && user.email) {
      recipients.add(user.email);
    }
  }
  console.log(`Found ${watchers.length} queue watcher(s).`);

  // exclude user who made the change
  if (userEmail) {
    console.log(`Excluding ${userEmail} from recipients.`);
    recipients.delete(userEmail);
  }

  return Array.from(recipients);
};

const sendEmail = async (change: TaskChange) => {
  const changeSummary = await getChangeSummary(change);
  if (changeSummary) {
    if (changeSummary.queue) {
      console.log(
        `[${changeSummary.latest.id}] CHANGED FIELDS`,
        JSON.stringify(changeSummary.fields),
      );
      const recipients = await getRecipients(changeSummary, change);
      if (recipients.length) {
        console.log(
          `[${changeSummary.latest.id}] 
          Sending notification to ${recipients.length} user(s).`
        );
        const {created, updated, deleted} = changeSummary.changeType;
        const task = changeSummary.latest;
        const body = await prepareEmailBody(changeSummary);
        const from = `Merge Queue <${functions.config().sendgrid.from}>`;
        let subject = (
          `${task.ticketNumber ? task.ticketNumber + " | " : ""}Merge Task `
        );
        subject += (
          created ? "Created" :
            updated ? "Updated" :
              deleted ? "Deleted" :
                "Changed"
        );
        const messages: sgMail.MailDataRequired[] = [];
        for (const email of recipients) {
          messages.push({
            to: email,
            from: from,
            subject: subject,
            text: body.text,
            html: body.html,
          });
        }
        return sgMail
          .send(messages, true).then((res) => {
            console.log("EMAIL STATUS", res.toString());
            return res;
          })
          .catch((e) => {
            console.error("ERROR SENDING EMAIL", e);

            return e;
          });
      } else {
        console.log("No notification recipients.");
      }
    } else {
      console.log("Queue no longer exists. Skipping notifications.");
    }
  } else {
    console.log("No changed fields.");
  }

  return true;
};

const hook = (change: TaskChange) => {
  if (notificationsEnabled) {
    return sendEmail(change);
  } else {
    console.log("Notifications are disabled.");
  }

  return true;
};

const queueItemChange = functions.firestore
  .document("queues/{queueId}/items/{itemId}")
  .onWrite(hook);

export {queueItemChange};
