// TEMPORARY — scratch harness for eyeballing the Part 5 primitives that only
// appear behind the dashboard's auth guard. Delete this file and its route.
import { useState } from "react";
import { MdEventNote } from "react-icons/md";
import {
  Alert,
  Button,
  Card,
  EmptyState,
  Modal,
  PageHeader,
  Skeleton,
  SkeletonGroup,
  SkeletonText,
  StatusPill,
  Table,
} from "@uc/ui";

const ROWS = [
  { _id: "1", name: "Ananya Sharma", date: "12 Aug 2026", dept: "Cardiology", status: "Pending" },
  { _id: "2", name: "Rohan Iyer", date: "13 Aug 2026", dept: "Neurology", status: "Accepted" },
  { _id: "3", name: "Meera Nair", date: "14 Aug 2026", dept: "Dentistry", status: "Rejected" },
  { _id: "4", name: "Vikram Rao", date: "15 Aug 2026", dept: "ENT", status: "Something else" },
];

const Preview = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-12">
      <PageHeader
        level={1}
        size="lg"
        title="Primitives"
        description="Scratch page for visual review."
        actions={<Button onClick={() => setOpen(true)}>Open modal</Button>}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
        <Button loading loadingText="Saving…">Save</Button>
        <Button disabled>Disabled</Button>
        <Button size="sm">Small</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card elevation="flat">
          <p className="text-sm text-fg-subtle">Flat</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-fg">24</p>
        </Card>
        <Card>
          <p className="text-sm text-fg-subtle">Resting (e1)</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-fg">8</p>
        </Card>
        <Card elevation="e2">
          <p className="text-sm text-fg-subtle">Raised (e2)</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-accent-text">3</p>
        </Card>
      </div>

      <div className="space-y-3">
        <Alert tone="info">An informational message.</Alert>
        <Alert tone="success">Saved successfully.</Alert>
        <Alert tone="warning">Please sign in before booking.</Alert>
        <Alert tone="danger" title="Could not load doctors">
          The server did not respond. Try refreshing.
        </Alert>
      </div>

      <Card padded={false}>
        <div className="border-b border-line px-6 py-4">
          <h2 className="text-lg font-semibold text-fg">Appointments</h2>
        </div>
        <Table
          caption="Sample appointments"
          rows={ROWS}
          columns={[
            { key: "name", header: "Patient", className: "font-medium text-fg" },
            { key: "date", header: "Date", className: "text-fg-muted" },
            { key: "dept", header: "Department", className: "text-fg-muted" },
            { key: "status", header: "Status", render: (r) => <StatusPill status={r.status} /> },
          ]}
        />
      </Card>

      <EmptyState
        icon={MdEventNote}
        title="No appointments booked yet"
        description="Bookings made from the patient website land here."
        action={<Button size="md">Add one</Button>}
      />

      <SkeletonGroup label="Loading appointments…">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <Skeleton className="h-5 w-1/3" />
            <SkeletonText className="mt-4" lines={3} />
          </Card>
          <Card>
            <Skeleton className="h-5 w-1/2" />
            <SkeletonText className="mt-4" lines={3} />
          </Card>
        </div>
      </SkeletonGroup>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Reject this appointment?"
        description="The patient will be notified."
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="md" onClick={() => setOpen(false)}>
              Reject
            </Button>
          </>
        }
      >
        <p className="text-sm text-fg-muted">
          Escape closes this, focus is trapped inside it, and the page behind it
          does not scroll.
        </p>
      </Modal>
    </div>
  );
};

export default Preview;
