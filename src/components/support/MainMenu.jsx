import './MainMenu.css'

function MainMenu({ options, onOptionClick }) {
  return (
    <div className="main-menu">
      {options.map((option) => (
        <button
          key={option.id}
          className="main-menu-button"
          onClick={() => onOptionClick(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default MainMenu
