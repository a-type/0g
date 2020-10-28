import { useThree } from 'react-three-fiber';
import { Vector3 } from 'three';

export function useGetPointerPosition() {
  const { camera, mouse } = useThree();

  return () => {
    if (camera.type === 'OrthographicCamera') {
      const vec = new Vector3(
        mouse.x,
        mouse.y,
        (camera.near + camera.far) / (camera.near - camera.far)
      );
      return vec.unproject(camera);
    } else {
      throw new Error('Not supported for projection camera yet');
    }
  };
}
