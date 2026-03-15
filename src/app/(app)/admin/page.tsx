export default function AdminPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin</h1>
          <p className="text-sm text-white/60 mt-1">
            Administration dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <a
            href="/admin/locations"
            className="rounded-2xl border border-white/10 bg-neutral-900 p-5 hover:bg-neutral-800 transition"
          >
            <div className="text-lg font-semibold">Locations</div>
            <div className="text-sm text-white/60 mt-2">
              Manage restaurant locations
            </div>
          </a>

          <a
            href="/admin/users"
            className="rounded-2xl border border-white/10 bg-neutral-900 p-5 hover:bg-neutral-800 transition"
          >
            <div className="text-lg font-semibold">Users</div>
            <div className="text-sm text-white/60 mt-2">
              Manage staff and PIN codes
            </div>
          </a>

          <a
            href="/admin/tables"
            className="rounded-2xl border border-white/10 bg-neutral-900 p-5 hover:bg-neutral-800 transition"
          >
            <div className="text-lg font-semibold">Areas & Tables</div>
            <div className="text-sm text-white/60 mt-2">
              Manage floors, areas and tables
            </div>
          </a>

          <a
            href="/admin/menu"
            className="rounded-2xl border border-white/10 bg-neutral-900 p-5 hover:bg-neutral-800 transition"
          >
            <div className="text-lg font-semibold">Menu</div>
            <div className="text-sm text-white/60 mt-2">
              Manage categories, items and modifiers
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
