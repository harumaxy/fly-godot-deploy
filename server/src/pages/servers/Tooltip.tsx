export function ToolTip(props: { values: [string, string] }) {
  return (
    <span class={"relative group"}>
      <span
        data-tooltip="tooltip"
        class="absolute -top-2 w-max z-50 whitespace-normal break-words rounded-lg bg-black py-1.5 px-3 font-sans text-sm font-normal text-white focus:outline-none opacity-0 group-hover:opacity-100 transition pointer-events-none"
      >
        {props.values[1]}
      </span>
      <p data-ripple-light="true" data-tooltip-target="tooltip">
        {props.values[0]}
      </p>
    </span>
  );
}
