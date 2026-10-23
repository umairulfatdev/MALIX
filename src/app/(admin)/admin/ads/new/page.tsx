import AdForm from "@/components/admin/ad-form";
import { createAdAction } from "@/server/actions/admin/ads";

export default function NewAdPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">Add New Ad</h1>
      <AdForm action={createAdAction} />
    </div>
  );
}