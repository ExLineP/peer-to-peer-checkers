import { createLazyFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { GenerateMatchModal } from '../components/generateMatchModal'

export const Route = createLazyFileRoute('/')({
  component: Index,
})

function Index() {
  const [modalOpen, setModalOpen] = useState(false)
  return (
    <div className="p-2 w-full flex flex-col justify-center gap-10 bg-red-50 h-full place-items-center">
      <span className='text-[40px] font-thin'>Peer-to-Peer Шашки</span>
      <div className='flex flex-col sm:flex-row gap-10 place-items-center'>
        <img className='w-[350px] h-[350px] p-4 bg-stone-700 rounded-xl select-none pointer-events-none' src='/checkers.png'/>
      <button onClick={() => setModalOpen(true)} className='px-5 h-[80px] bg-gray-500 text-white text-xl font-medium rounded-md active:opacity-70 hover:opacity-85'>Сгенерировать комнату!</button>
      </div>
      {modalOpen && <GenerateMatchModal onClose={() => setModalOpen(false)}/>}
    </div>
  )
}