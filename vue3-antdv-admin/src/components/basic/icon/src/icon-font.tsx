import { defineComponent } from 'vue';
// import { createFromIconfontCN } from '@ant-design/icons-vue';
import type { PropType } from 'vue';
import { uniqueSlash } from '@/utils/urlUtils';

let scriptUrls = [uniqueSlash(`${import.meta.env.BASE_URL}/iconfont.js`)];

// 文档：https://antdv.com/components/icon-cn#components-icon-demo-iconfont
// let MyIconFont = createFromIconfontCN({
//   scriptUrl: scriptUrls,
// });

export default defineComponent({
  name: 'IconFont',
  props: {
    type: {
      type: String as PropType<string>,
      default: '',
    },
    prefix: {
      type: String,
      default: 'icon-',
    },
    color: {
      type: String as PropType<string>,
      default: 'unset',
    },
    size: {
      type: [Number, String] as PropType<number | string>,
      default: 14,
    },
    scriptUrl: {
      // 阿里图库字体图标路径
      type: String as PropType<string | string[]>,
      default: '',
    },
  },
  setup(props) {
    // 如果外部传进来字体图标路径，则覆盖默认的
    if (props.scriptUrl) {
      scriptUrls = [...new Set(scriptUrls.concat(props.scriptUrl))];
      // MyIconFont = createFromIconfontCN({
      //   scriptUrl: scriptUrls,
      // });
    }

    // const wrapStyleRef = computed(() => {
    //   const { color, size } = props;
    //   const fs = isString(size) ? parseFloat(size) : size;
    //   return {
    //     color,
    //     fontSize: `${fs}px`,
    //   };
    // });

    return () => {
      const { type } = props;

      return type ? (
        // <MyIconFont
        //   type={type.startsWith(prefix) ? type : `${prefix}${type}`}
        //   {...attrs}
        //   style={unref(wrapStyleRef)}
        // />
        <span>MyInconFont</span>
      ) : null;
    };
  },
});
