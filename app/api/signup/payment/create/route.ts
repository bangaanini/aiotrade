export async function POST() {
  return Response.json(
    {
      message: "Pembayaran pendaftaran sekarang dimulai dari form signup.",
    },
    { status: 410 },
  );
}
