// スタンプの絵：image（自作SVGなど）があればそれ、なければ絵文字
export function StampArt({ stamp, size }) {
  if (stamp.image) {
    return <img className="stamp-img" src={import.meta.env.BASE_URL + stamp.image} alt="" style={size ? { width: size, height: size } : undefined} />
  }
  return <span className="stamp-emoji" style={size ? { fontSize: size } : undefined}>{stamp.emoji}</span>
}
