import { DataTable } from "@/components/shared/DataTable";
import { studentColumns, tutorColumns } from "@/components/UsersTableColumns";

const columnsByUserType = {
  student: studentColumns,
  tutor: tutorColumns,
};

const getUserRowKey = (user) => user.id;
const getUserRowClassName = () => "hover:bg-muted/30";

function UsersDataTable({ userType, data }) {
  return (
    <div className="min-w-0 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
      <DataTable
        columns={columnsByUserType[userType]}
        data={data}
        emptyMessage={null}
        getRowKey={getUserRowKey}
        getRowClassName={getUserRowClassName}
        className="rounded-none border-0 bg-card shadow-none lg:flex lg:min-h-0 lg:flex-1 lg:flex-col"
        tableClassName="min-w-[760px] border-collapse text-left"
        tableContainerClassName="overflow-auto lg:min-h-0 lg:flex-1 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border"
      />
    </div>
  );
}

export default UsersDataTable;
