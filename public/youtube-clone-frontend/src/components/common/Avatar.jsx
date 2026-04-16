export default function Avatar({ src, name, size = 32, style, onClick }) {
  const initial = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div
      className="avatar"
      style={{
        width: size, height: size,
        fontSize: size * 0.4,
        ...style,
      }}
      onClick={onClick}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        />
      ) : null}
      <span style={{ display: src ? 'none' : 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        {initial}
      </span>
    </div>
  );
}
