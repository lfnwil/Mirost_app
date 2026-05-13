export default function RequiredMark() {
  return (
    <>
      <span className="ml-1 text-rose-600" aria-hidden="true">
        *
      </span>
      <span className="sr-only">obligatoire</span>
    </>
  )
}
