import { utilityRoutes, resultsRoutes } from '@/utils/routes'
import RouteCards from './route-cards'

function MoreRoutes() {
  return (
    <div>
      <div className="">
        <RouteCards
          parentRoute="Result Processing"
          routes={resultsRoutes}
          cardBgColor="bg-white"
          cardHoverColor="bg-blue-50"
          textColor="text-gray-800"
          parentRouteColor="text-blue-600"
        />
      </div>
      <div className="">
        <RouteCards
          parentRoute="Utility"
          routes={utilityRoutes}
          cardBgColor="bg-white"
          cardHoverColor="bg-blue-50"
          textColor="text-gray-800"
          parentRouteColor="text-blue-600"
        />
      </div>
    </div>
  )
}

export default MoreRoutes
