export function TableHeader() {
  const headers = [
    "ID",
    "Fly Machine ID",
    "Server Password",
    "Domain",
    "UDP Port",
    "Max Players",
    "Status",
    "Last Updated",
    "Actions",
  ];
  return (
    <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
      <tr>
        {headers.map((key) => (
          <th scope="col" class="text-lg px-6 py-3 text-center">
            {key}
          </th>
        ))}
      </tr>
    </thead>
  );
}
