import { createRootRoute, Outlet } from '@tanstack/react-router'
export const Route = createRootRoute({
  component: () => (
    <div className='flex flex-col h-screen relative'>
      <Outlet />
    </div>
  ),
})