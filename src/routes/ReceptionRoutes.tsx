import { Route } from 'react-router-dom'
import RoleRoute from '@/components/auth/RoleRoute'
import Reception from '@/pages/Reception'

export default function ReceptionRoutes() {
  return (
    <>
      <Route element={<RoleRoute roles={['employee','owner']} />}>
        <Route path="/reception" element={<Reception />} />
      </Route>
    </>
  )
}
