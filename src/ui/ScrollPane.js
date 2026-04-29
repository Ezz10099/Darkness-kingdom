export function createVerticalScroll(scene, container, {
  x = 0,
  y = 0,
  width = 480,
  height = 600,
  contentHeight = height,
  wheelSpeed = 1
} = {}) {
  let scrollY = 0;
  let dragStart = null;
  let currentContentHeight = contentHeight;

  const maskGraphics = scene.make.graphics({ x: 0, y: 0, add: false });
  maskGraphics.fillStyle(0xffffff);
  maskGraphics.fillRect(x, y, width, height);
  const mask = maskGraphics.createGeometryMask();
  container.setMask(mask);

  const maxScroll = () => Math.max(0, currentContentHeight - height);
  const apply = (nextY) => {
    scrollY = Phaser.Math.Clamp(nextY, -maxScroll(), 0);
    container.y = y + scrollY;
  };

  const inBounds = pointer => pointer.x >= x && pointer.x <= x + width && pointer.y >= y && pointer.y <= y + height;
  const onWheel = (pointer, gameObjects, deltaX, deltaY) => {
    if (!inBounds(pointer)) return;
    apply(scrollY - (deltaY * wheelSpeed));
  };
  const onPointerDown = (pointer) => {
    if (!inBounds(pointer)) return;
    dragStart = { y: pointer.y, scrollY };
  };
  const onPointerMove = (pointer) => {
    if (!dragStart || !pointer.isDown) return;
    apply(dragStart.scrollY + (pointer.y - dragStart.y));
  };
  const onPointerUp = () => { dragStart = null; };

  scene.input.on('wheel', onWheel);
  scene.input.on('pointerdown', onPointerDown);
  scene.input.on('pointermove', onPointerMove);
  scene.input.on('pointerup', onPointerUp);
  scene.input.on('pointerupoutside', onPointerUp);

  const api = {
    apply,
    setContentHeight(nextHeight) {
      currentContentHeight = Math.max(height, nextHeight || height);
      apply(scrollY);
    },
    destroy() {
      scene.input.off('wheel', onWheel);
      scene.input.off('pointerdown', onPointerDown);
      scene.input.off('pointermove', onPointerMove);
      scene.input.off('pointerup', onPointerUp);
      scene.input.off('pointerupoutside', onPointerUp);
      container.clearMask();
      maskGraphics.destroy();
    }
  };

  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => api.destroy());
  apply(0);
  return api;
}

export default createVerticalScroll;
