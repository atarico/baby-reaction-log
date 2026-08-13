const pad = (value: number): string => String(value).padStart(2, '0')

/** Local value expected by an `<input type="datetime-local">`: YYYY-MM-DDTHH:mm. */
export const toDateTimeInputValue = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
  `T${pad(date.getHours())}:${pad(date.getMinutes())}`

export const fromDateTimeInputValue = (value: string): string => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) throw new RangeError(`"${value}" is not a valid date and time`)

  return date.toISOString()
}
