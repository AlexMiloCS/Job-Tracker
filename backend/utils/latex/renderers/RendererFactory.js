import DetailedListRenderer from './DetailedListRenderer.js';
import ProjectListRenderer from './ProjectListRenderer.js';
import SimpleListRenderer from './SimpleListRenderer.js';
import TagsListRenderer from './TagsListRenderer.js';

class RendererFactory {
  static getRenderer(type) {
    switch (type) {
      case 'DetailedList':
        return new DetailedListRenderer();
      case 'ProjectList':
        return new ProjectListRenderer();
      case 'SimpleList':
        return new SimpleListRenderer();
      case 'TagsList':
        return new TagsListRenderer();
      default:
        return null;
    }
  }
}

export default RendererFactory;
