import React from 'react';
import { Link } from 'react-router-dom';

const RouteCards = ({ 
  parentRoute, 
  routes, 
  cardBgColor = 'bg-white', 
  cardHoverColor = 'bg-gray-50',
  textColor = 'text-gray-800',
  parentRouteColor = 'text-white'
}) => {
  return (
    <div className="p-4 md:p-6">
      {/* Parent Route Title */}
      <h2 className={`text-2xl md:text-3xl font-bold mb-6 text-white ${parentRouteColor}`}>
        {parentRoute}
      </h2>
      
      {/* Route Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {routes.map((route, index) => (
          <Link 
            to={route.path} 
            key={index}
            className={`block rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ${cardBgColor} hover:${cardHoverColor} overflow-hidden`}
          >
            <div className="p-4 md:p-6">
              <h3 className={`text-lg md:text-xl font-semibold mb-2 ${textColor}`}>
                {route.name}
              </h3>
              {route.description && (
                <p className="text-gray-600 text-sm md:text-base">
                  {route.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RouteCards;