export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ merchantId: string }>;
}) {
  const { merchantId } = await params;
  return (
    <div className="flex h-full items-center justify-center">
      <h1 className="text-2xl font-instrument text-primary">
        Checkout for {merchantId}
      </h1>
    </div>
  );
}
