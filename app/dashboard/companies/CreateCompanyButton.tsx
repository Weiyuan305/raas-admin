'use client'

import { useState } from 'react'
import CreateCompanyModal from './CreateCompanyModal'

export default function CreateCompanyButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
      >
        + 新建公司
      </button>
      {open && <CreateCompanyModal onClose={() => setOpen(false)} />}
    </>
  )
}
