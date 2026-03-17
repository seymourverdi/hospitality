export default function AdminMenuPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        <div>
          <h1 className="text-3xl font-bold">Menu</h1>
          <p className="text-sm text-white/60 mt-1">
            Manage menu categories, items and modifiers
          </p>
        </div>

        {/* ADMIN NAVIGATION */}

        <div className="flex flex-wrap gap-3">
          <a
            href="/admin"
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 transition"
          >
            Dashboard
          </a>

          <a
            href="/admin/users"
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 transition"
          >
            Users
          </a>

          <a
            href="/admin/locations"
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 transition"
          >
            Locations
          </a>

          <a
            href="/admin/areas"
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 transition"
          >
            Areas
          </a>

          <a
            href="/admin/tables"
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 transition"
          >
            Tables
          </a>
        </div>

        {/* MENU MANAGEMENT */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          <a
            href="/admin/menu/categories"
            className="rounded-2xl border border-white/10 bg-neutral-900 p-5 hover:bg-neutral-800 transition"
          >
            <div className="text-lg font-semibold">
              Categories
            </div>

            <div className="text-sm text-white/60 mt-2">
              Manage menu categories
            </div>
          </a>

          <a
            href="/admin/menu/items"
            className="rounded-2xl border border-white/10 bg-neutral-900 p-5 hover:bg-neutral-800 transition"
          >
            <div className="text-lg font-semibold">
              Items
            </div>

            <div className="text-sm text-white/60 mt-2">
              Manage menu items
            </div>
          </a>

          <a
            href="/admin/menu/modifier-groups"
            className="rounded-2xl border border-white/10 bg-neutral-900 p-5 hover:bg-neutral-800 transition"
          >
            <div className="text-lg font-semibold">
              Modifier Groups
            </div>

            <div className="text-sm text-white/60 mt-2">
              Manage modifier groups
            </div>
          </a>

          <a
            href="/admin/menu/modifier-options"
            className="rounded-2xl border border-white/10 bg-neutral-900 p-5 hover:bg-neutral-800 transition"
          >
            <div className="text-lg font-semibold">
              Modifier Options
            </div>

            <div className="text-sm text-white/60 mt-2">
              Manage modifier options
            </div>
          </a>

        </div>
      </div>
    </div>
  )
}