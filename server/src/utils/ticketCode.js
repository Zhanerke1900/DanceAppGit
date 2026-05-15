import Sequence from "../models/Sequence.js";

export async function generateNextTicketCode(date = new Date()) {
  const year = date.getFullYear();
  // findOneAndUpdate + $inc дает уникальный порядковый номер даже при нескольких покупках одновременно.
  const sequence = await Sequence.findOneAndUpdate(
    { key: `ticket:${year}` },
    { $inc: { value: 1 } },
    { upsert: true, new: true }
  );

  return `DT-${year}-${String(sequence.value).padStart(6, "0")}`;
}
