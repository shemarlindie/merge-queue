const functions = require("firebase-functions");
const firestore = functions.firestore;
const path = require("path");
const Email = require("email-templates");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(functions.config().sendgrid.key);

const userFormatter = (user) => {
  return user ? user.displayName : "-";
};

const typeFormatter = (type) => {
  return type ? type.sort().join(", ") : "-";
};

const valueFormatter = (value) => {
  return [undefined, null, ""].includes(value) ? "-" : value;
};

const userComparer = (a, b) => {
  return a && b ? a.uid === b.uid : a === b;
};

const typeComparer = (a, b) => {
  return a && b ? typeFormatter(a) === typeFormatter(b) : a === b;
};

const valueComparer = (a, b) => {
  return a === b;
};

const watchedFields = {
  basedOnVersion: {comparer: valueComparer, formatter: valueFormatter},
  description: {comparer: valueComparer, formatter: valueFormatter},
  developer: {comparer: userComparer, formatter: userFormatter},
  client: {comparer: valueComparer, formatter: valueFormatter},
  jiraPriority: {comparer: valueComparer, formatter: valueFormatter},
  mrLink: {comparer: valueComparer, formatter: valueFormatter},
  mrLink2: {comparer: valueComparer, formatter: valueFormatter},
  priority: {comparer: valueComparer, formatter: valueFormatter},
  qaAssignee: {comparer: userComparer, formatter: userFormatter},
  reviewer: {comparer: userComparer, formatter: userFormatter},
  section: {comparer: valueComparer, formatter: valueFormatter},
  status: {comparer: valueComparer, formatter: valueFormatter},
  ticketNumber: {comparer: valueComparer, formatter: valueFormatter},
  type: {comparer: typeComparer, formatter: typeFormatter},
};

const getChangeType = (change) => {
  const created = !change.before.data();
  const deleted = !change.after.data();
  const updated = !!(change.before.data() && change.after.data());

  return {created, updated, deleted};
};

const computeChangedFields = (change) => {
  let changed;
  const before = change.before.data();
  const after = change.after.data();

  // if we don't have before AND after an item was either created or deleted
  // which means all fields changed
  if (!(before && after)) changed = Object.keys(watchedFields);

  // check for changed fields
  else {
    changed = [];
    for (const field in watchedFields) {
      const compare = watchedFields[field]["comparer"];
      if (!compare(before[field], after[field])) {
        changed.push(field);
      }
    }
  }
  return changed;
};

const getChangedFields = (change) => {
  const fields = computeChangedFields(change);

  if (fields.length) {
    const changeType = getChangeType(change);
    const latest = change.after.data() || change.before.data();
    const changedFields = {fields, changeType, latest, before: {}, after: {}};
    for (const key of fields) {
      changedFields.before[key] = change.before.get(key);
      changedFields.after[key] = change.after.get(key);
    }

    return changedFields;
  }

  return null;
};

const prepareHtmlDiff = (changedFields) => {
  const htmlDiff = {};

  for (const key of changedFields.fields) {
    const format = watchedFields[key]["formatter"];
    if (changedFields.changeType.created) {
      htmlDiff[key] = `<ins aria-label="added value">${format(changedFields.after[key])}</ins>`;
    } else if (changedFields.changeType.deleted) {
      htmlDiff[key] = `<del aria-label="removed value">${format(changedFields.before[key])}</del>`;
    } else {
      htmlDiff[key] = `<del aria-label="changed from">${format(changedFields.before[key])}</del> <ins aria-label="changed to">${format(changedFields.after[key])}</ins>`;
    }
  }

  return htmlDiff;
};

const prepareTextDiff = (changedFields) => {
  const textDiff = {};

  for (const key of changedFields.fields) {
    const format = watchedFields[key]["formatter"];
    if (changedFields.changeType.created) {
      textDiff[key] = `Added: ${format(changedFields.after[key])}`;
    } else if (changedFields.changeType.deleted) {
      textDiff[key] = `Removed: ${format(changedFields.before[key])}`;
    } else {
      textDiff[key] = `Before: ${format(changedFields.before[key])} | After: ${format(changedFields.after[key])}`;
    }
  }

  return textDiff;
};

const prepareEmailBody = async (changedFields, htmlDiff, textDiff) => {
  const body = {};
  const email = new Email();
  body.html = await email.render(
    {
      path: path.join(__dirname, "templates", "queue-item-change"),
      juiceResources: {
        webResources: {
          relativeTo: path.join(__dirname, "templates")
        }
      }
    },
    {changedFields, htmlDiff}
  );
  body.text = await email.render(
    path.join(__dirname, "templates", "queue-item-change-text"), {changedFields, textDiff}
  );

  return body;
};

const sendEmail = async (change) => {
  const user = change.before.data().developer || change.after.data().developer;
  if (user && user.email) {
    const changedFields = getChangedFields(change);
    if (changedFields) {
      console.log("CHANGED FIELDS", JSON.stringify(changedFields.fields));
      const {created, updated, deleted} = changedFields.changeType;
      const task = changedFields.latest;
      const htmlDiff = prepareHtmlDiff(changedFields);
      const textDiff = prepareTextDiff(changedFields);
      const body = await prepareEmailBody(changedFields, htmlDiff, textDiff);
      const msg = {
        to: user.email,
        from: `Merge Queue <${functions.config().sendgrid.from}>`,
        subject: `${task.ticketNumber ? task.ticketNumber + " | " : ""}Merge Task ${created ? "Created" : updated ? "Updated" : deleted ? "Deleted" : "Changed"}`,
        text: body.text,
        html: body.html,
      };

      return sgMail
        .send(msg).then(res => {
          console.log("EMAIL STATUS", res.toString());
          return res;
        })
        .catch((e) => {
          console.error("ERROR SENDING EMAIL", e);

          return e;
        });
    } else {
      console.log("No changed fields.");
    }
  }

  return true;
};

const hook = (change) => {
  return sendEmail(change);
};

const queueItemChange = firestore
  .document("queues/{queueId}/items/{itemId}")
  .onWrite(hook);

module.exports = {queueItemChange};
