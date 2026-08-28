import { DataTable } from "@/components/shared/DataTable";
import { studentColumns, tutorColumns } from "@/components/UsersTableColumns";

const columnsByUserType = {
  student: studentColumns,
  tutor: tutorColumns,
};

const getUserRowKey = (user) => user.id;
const getUserRowClassName = () => "hover:bg-muted/35";

function UsersDataTable({ userType, data }) {
  return (
    <DataTable
      columns={columnsByUserType[userType]}
      data={data}
      emptyMessage={null}
      getRowKey={getUserRowKey}
      getRowClassName={getUserRowClassName}
      className="rounded-lg border border-border bg-card shadow-none"
      tableClassName="min-w-[760px] border-collapse text-left"
      tableContainerClassName="max-h-[440px] overflow-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border"
      headerClassName="sticky top-0 z-10 bg-muted/80 shadow-sm"
    />
  );
}

export default UsersDataTable;
