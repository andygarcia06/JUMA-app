import React from 'react';

const AllSubMenus = () => {
  const subMenus = [
    { name: 'Bon d\'achat', anchor: 'bon-achat' },
    { name: 'Cinéma', anchor: 'cinema' },
    { name: 'Culture', anchor: 'culture' },
    { name: 'Loisirs', anchor: 'loisirs' },
    { name: 'Spectacles et événements', anchor: 'spectacles' },
    { name: 'Bons plans', anchor: 'bons-plans' },
    { name: 'Voyages', anchor: 'voyages' },
    { name: 'Parfums', anchor: 'parfums' },
    { name: 'Dons', anchor: 'dons' }
  ];

  return (
    <div className="all-sub-menus">
      <h3>Tous les sous-menus</h3>
      <ul>
        {subMenus.map((menu, index) => (
          <li key={index}>
            <a href={`#${menu.anchor}`}>{menu.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AllSubMenus;
