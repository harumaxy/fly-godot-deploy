interface Props {
  name: string;
}

export function TextInput({ name }: Props) {
  return (
    <div>
      <label
        for={name}
        class="block text-xl font-medium leading-6 text-gray-900"
      >
        {name}
      </label>
      <div class="mt-2 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
        <input
          id="search-form"
          name={name}
          class="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
        />
      </div>
    </div>
  );
}
