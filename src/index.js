import defaults from '../config/defaults';
import version from '../config/version';

import inBrowser from './utils/inBrowser';

class Rating {
  constructor(el, opt) {
    this.$el = el;
    this.options = {
      ...defaults,
      ...opt,
    };
    this.isHalf = false;
    this.value = this.initValue();
    this.hoverIndex = this.value;
    this.lastHoverIndex = this.value;
    this.init();
    this.version = version;
  }

  init() {
    if (!this.$el) {
      throw new Error('this.$el must be exsits.');
    }
    this.genItems();
    this.initStyle();
  }

  initValue() {
    return this.options.isHalf ? this.options.value : Math.floor(this.options.value);
  }

  initStyle() {
    const remainder = this.value % 1;
    const currentItemIndex = Math.ceil(this.value);
    this.hoverIndex = currentItemIndex;
    this.isHalf = remainder ? 1 : 0;
    this.setItemClass(this.$el.querySelectorAll('.star-item')[currentItemIndex - 1]);
  }

  setHoverIndex(e) {
    const index = parseInt(e.target.dataset.index, 10) - 1;

    this.hoverIndex = index + (this.options.isHalf && this.isHalf ? 0.5 : 1);
  }

  setItemClass(e) {
    const currentEl = e.target || e;
    const remainder = this.value % 1;

    // current item
    if (this.isHalf) {
      if (currentEl.classList.contains('star-filled')) {
        currentEl.classList.remove('star-filled');
      }
      currentEl.classList.add('star-half');
    } else {
      if (currentEl.classList.contains('star-half')) {
        currentEl.classList.remove('star-half');
      }
      currentEl.classList.add('star-filled');
    }
    currentEl.classList.remove('star-outline');

    if (this.hoverIndex < this.value) {
      let nextEl = currentEl.nextElementSibling;
      while (nextEl && parseInt(nextEl.dataset.index, 10) < this.value) {
        nextEl.classList.remove('star-outline');
        nextEl.classList.add('star-filled');
        nextEl = nextEl.nextElementSibling;
      }

      if (remainder) {
        nextEl.classList.remove('star-outline');
        nextEl.classList.add('star-half');
      }
    } else {
      let prevEl = currentEl.previousElementSibling;
      while (prevEl) {
        if (prevEl.classList.contains('star-half')) {
          prevEl.classList.remove('star-half');
        }

        if (!prevEl.classList.contains('star-filled')) {
          prevEl.classList.remove('star-outline');
          prevEl.classList.add('star-filled');
        }
        prevEl = prevEl.previousElementSibling;
      }

      if (prevEl && remainder) {
        prevEl.classList.remove('star-half');
        prevEl.classList.add('star-filled');
      }
    }

    // next item
    this.removeNextItemClass(e);
  }

  removeItemClass(e) {
    const currentEl = e.target || e;
    const remainder = this.value % 1;
    const activeIndex = Math.ceil(this.value);
    const currentIndex = parseInt(currentEl.dataset.index, 10);

    if (currentIndex === activeIndex) {
      if (currentEl.classList.contains('star-outline')) currentEl.classList.remove('star-outline');
      // current item
      if (!remainder && this.isHalf) {
        currentEl.classList.remove('star-half');
        currentEl.classList.add('star-filled');
      }

      if (!this.isHalf && !currentEl.classList.contains('star-filled')) {
        currentEl.classList.add('star-filled');
      }
    }

    if (currentIndex > activeIndex) {
      // current item
      if (this.isHalf) {
        currentEl.classList.remove('star-half');
      } else {
        currentEl.classList.remove('star-filled');
      }

      // prev item
      let prevEl = currentEl.previousElementSibling;
      while (prevEl && parseInt(prevEl.dataset.index, 10) > activeIndex) {
        prevEl.classList.add('star-outline');
        prevEl.classList.remove('star-filled');
        prevEl = prevEl.previousElementSibling;
      }

      if (prevEl && remainder) {
        prevEl.classList.add('star-half');
      }

      // next item
      this.removeNextItemClass(e);
    } else {
      let nextEl = currentEl;
      while (nextEl && parseInt(nextEl.dataset.index, 10) < activeIndex) {
        if (nextEl.classList.contains('star-half')) {
          nextEl.classList.remove('star-half');
        }
        nextEl.classList.add('star-filled');
        nextEl.classList.remove('star-outline');
        nextEl = nextEl.nextElementSibling;
      }

      if (remainder) {
        if (nextEl.classList.contains('star-filled')) nextEl.classList.remove('star-filled');
        nextEl.classList.add('star-half');
      } else {
        nextEl.classList.add('star-filled');
      }
    }
  }

  removeNextItemClass(e) {
    const currentEl = e.target || e;
    const remainder = this.lastHoverIndex % 1;
    let nextEl = currentEl.nextElementSibling;
    while (nextEl && parseInt(nextEl.dataset.index, 10) <= this.lastHoverIndex) {
      nextEl.classList.remove('star-filled');
      nextEl.classList.add('star-outline');
      nextEl = nextEl.nextElementSibling;
    }

    if (nextEl) {
      if (remainder) {
        nextEl.classList.remove('star-half');
        nextEl.classList.add('star-outline');
      } else {
        nextEl.classList.remove('star-filled');
        nextEl.classList.add('star-outline');
      }
    }
  }

  genItems() {
    const itemContainer = document.createDocumentFragment();

    for (let i = 0; i < this.options.length; i += 1) {
      const item = document.createElement('span');
      item.classList.add('star-item');
      item.classList.add('star-outline');
      item.dataset.index = i + 1;
      this.attachEvent(item);
      itemContainer.appendChild(item);
    }

    this.$el.appendChild(itemContainer);
  }

  attachEvent(item) {
    const mouseEnterHandler = this.mouseEnterHandler.bind(this);
    const mouseLeaveHandler = this.mouseLeaveHandler.bind(this);
    const mouseClickHandler = this.mouseClickHandler.bind(this);
    item.addEventListener('mouseenter', mouseEnterHandler);
    item.addEventListener('mouseleave', mouseLeaveHandler);
    item.addEventListener('click', mouseClickHandler);
    item.addEventListener('mousemove', mouseEnterHandler);
  }

  mouseEnterHandler(e) {
    if (this.options.isHalf) {
      this.setIsHalf(e);
    } else {
      this.isHalf = false;
    }
    if (this.lastHoverIndex !== this.value) this.lastHoverIndex = this.value;
    this.setHoverIndex(e);
    this.setItemClass(e);
  }

  mouseLeaveHandler(e) {
    this.hoverIndex = this.value;
    if (this.options.isHalf) {
      this.setIsHalf(e);
    } else {
      this.isHalf = false;
    }
    this.removeItemClass(e);
  }

  mouseClickHandler(e) {
    this.setHoverIndex(e);
    if (this.value !== this.hoverIndex) {
      this.value = this.hoverIndex;
      this.lastHoverIndex = this.value;
    }
    if (this.options.isHalf) {
      this.setIsHalf(e);
    } else {
      this.isHalf = false;
    }
    this.setItemClass(e);
  }

  setIsHalf(e) {
    const rect = e.target && e.target.getBoundingClientRect();
    if (rect && (e.pageX - rect.left) < rect.width / 2) {
      this.isHalf = true;
    } else {
      this.isHalf = false;
    }
  }
}

if (inBrowser) {
  window.Rating = Rating;
  window.console.log('plugin is running browser.');
}

export default Rating;
