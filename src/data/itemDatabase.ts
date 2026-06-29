import { ItemCategory, Season, TripType, Destination } from '../types';

export interface BaseItem {
  name: string;
  category: ItemCategory;
  importance: number;
  tips?: string;
  climates?: Destination['climate'][];
  seasons?: Season[];
  tripTypes?: TripType[];
}

export interface DestinationWithPinyin extends Destination {
  pinyin: string;
  initial: string;
}

export const baseItems: BaseItem[] = [
  // 衣物类 - 上衣
  { name: '短袖T恤', category: 'clothing', importance: 4, seasons: ['spring', 'summer', 'autumn'] },
  { name: '长袖T恤', category: 'clothing', importance: 3, seasons: ['autumn', 'winter', 'spring'] },
  { name: '衬衫', category: 'clothing', importance: 4, tripTypes: ['business'] },
  { name: '休闲衬衫', category: 'clothing', importance: 3, tripTypes: ['leisure', 'family'] },
  { name: '卫衣', category: 'clothing', importance: 3, seasons: ['autumn', 'winter', 'spring'] },
  { name: '西装', category: 'clothing', importance: 5, tripTypes: ['business'] },
  { name: '外套', category: 'clothing', importance: 4 },
  { name: '羽绒服', category: 'clothing', importance: 3, climates: ['cold'], seasons: ['winter'] },
  { name: '冲锋衣', category: 'clothing', importance: 3, tripTypes: ['outdoor'], climates: ['cold', 'temperate'] },
  { name: '泳装', category: 'clothing', importance: 3, climates: ['tropical'] },
  { name: '内衣', category: 'clothing', importance: 5 },
  { name: '袜子', category: 'clothing', importance: 4 },

  // 衣物类 - 下装
  { name: '牛仔裤', category: 'clothing', importance: 4 },
  { name: '休闲裤', category: 'clothing', importance: 4 },
  { name: '正装裤', category: 'clothing', importance: 4, tripTypes: ['business'] },
  { name: '运动裤', category: 'clothing', importance: 3, tripTypes: ['outdoor', 'family'] },
  { name: '短裤', category: 'clothing', importance: 4, seasons: ['summer'], climates: ['tropical', 'temperate'] },
  { name: '裙子', category: 'clothing', importance: 3, tripTypes: ['leisure', 'honeymoon'] },
  { name: '长裙', category: 'clothing', importance: 2, tripTypes: ['honeymoon'] },

  // 衣物类 - 外套
  { name: '夹克', category: 'clothing', importance: 3, seasons: ['spring', 'autumn'] },
  { name: '大衣', category: 'clothing', importance: 3, climates: ['cold', 'temperate'], seasons: ['autumn', 'winter'] },
  { name: '马甲', category: 'clothing', importance: 2, tripTypes: ['outdoor'] },

  // 衣物类 - 鞋履
  { name: '运动鞋', category: 'clothing', importance: 4 },
  { name: '休闲鞋', category: 'clothing', importance: 4 },
  { name: '正装皮鞋', category: 'clothing', importance: 4, tripTypes: ['business'] },
  { name: '凉鞋', category: 'clothing', importance: 3, climates: ['tropical'], seasons: ['summer'] },
  { name: '拖鞋', category: 'clothing', importance: 3 },
  { name: '登山鞋', category: 'clothing', importance: 4, tripTypes: ['outdoor'] },
  { name: '雨鞋', category: 'clothing', importance: 2, seasons: ['rainy'] },

  // 衣物类 - 配饰
  { name: '帽子', category: 'clothing', importance: 3 },
  { name: '围巾', category: 'clothing', importance: 3, climates: ['cold', 'temperate'] },
  { name: '手套', category: 'clothing', importance: 2, climates: ['cold'], seasons: ['winter'] },
  { name: '墨镜', category: 'clothing', importance: 3, climates: ['tropical', 'desert'] },
  { name: '腰带', category: 'clothing', importance: 3 },

  // 洗护类 - 基础清洁
  { name: '牙刷', category: 'toiletries', importance: 5 },
  { name: '牙膏', category: 'toiletries', importance: 5 },
  { name: '洗发水', category: 'toiletries', importance: 4 },
  { name: '沐浴露', category: 'toiletries', importance: 4 },
  { name: '香皂', category: 'toiletries', importance: 3 },
  { name: '洗衣液', category: 'toiletries', importance: 3 },
  { name: '洗衣粉', category: 'toiletries', importance: 2 },

  // 洗护类 - 护肤
  { name: '面霜', category: 'toiletries', importance: 4 },
  { name: '防晒霜', category: 'toiletries', importance: 5, climates: ['tropical', 'desert'] },
  { name: '唇膏', category: 'toiletries', importance: 3 },
  { name: '护手霜', category: 'toiletries', importance: 3 },
  { name: '面膜', category: 'toiletries', importance: 3, tripTypes: ['honeymoon', 'leisure'] },

  // 洗护类 - 化妆
  { name: '化妆品', category: 'toiletries', importance: 3 },
  { name: '卸妆水', category: 'toiletries', importance: 3 },
  { name: '洗面奶', category: 'toiletries', importance: 4 },

  // 洗护类 - 个人护理
  { name: '毛巾', category: 'toiletries', importance: 4 },
  { name: '梳子', category: 'toiletries', importance: 3 },
  { name: '吹风机', category: 'toiletries', importance: 3 },
  { name: '剃须刀', category: 'toiletries', importance: 4, tripTypes: ['business'] },
  { name: '卫生纸', category: 'toiletries', importance: 4 },
  { name: '湿巾', category: 'toiletries', importance: 3 },
  { name: '纸巾', category: 'toiletries', importance: 4 },

  // 药品类
  { name: '感冒药', category: 'medicine', importance: 4 },
  { name: '退烧药', category: 'medicine', importance: 4 },
  { name: '止泻药', category: 'medicine', importance: 4 },
  { name: '创可贴', category: 'medicine', importance: 5 },
  { name: '消炎药', category: 'medicine', importance: 3 },
  { name: '绷带', category: 'medicine', importance: 3 },
  { name: '晕车药', category: 'medicine', importance: 4 },
  { name: '驱蚊液', category: 'medicine', importance: 4, climates: ['tropical'] },
  { name: '眼药水', category: 'medicine', importance: 3 },
  { name: '润喉糖', category: 'medicine', importance: 3 },
  { name: '体温计', category: 'medicine', importance: 3, tripTypes: ['family'] },
  { name: '口罩', category: 'medicine', importance: 4 },

  // 电子类
  { name: '手机充电器', category: 'electronics', importance: 5 },
  { name: '充电宝', category: 'electronics', importance: 4 },
  { name: '耳机', category: 'electronics', importance: 3 },
  { name: '笔记本电脑', category: 'electronics', importance: 4, tripTypes: ['business'] },
  { name: '平板电脑', category: 'electronics', importance: 3 },
  { name: '相机', category: 'electronics', importance: 3, tripTypes: ['leisure', 'honeymoon'] },
  { name: '转换插头', category: 'electronics', importance: 4 },
  { name: '插线板', category: 'electronics', importance: 3 },
  { name: '数据线', category: 'electronics', importance: 4 },
  { name: 'U盘', category: 'electronics', importance: 3, tripTypes: ['business'] },
  { name: '移动硬盘', category: 'electronics', importance: 2 },
  { name: '智能手表', category: 'electronics', importance: 3 },
  { name: '自拍杆', category: 'electronics', importance: 2, tripTypes: ['leisure', 'honeymoon'] },
];

export function getAllItems(customItems: BaseItem[] = []): BaseItem[] {
  const existingNames = new Set(baseItems.map(item => item.name));
  const merged = [...baseItems];
  
  customItems.forEach(item => {
    if (!existingNames.has(item.name)) {
      merged.push(item);
      existingNames.add(item.name);
    }
  });
  
  return merged;
}

export const destinations: DestinationWithPinyin[] = [
  { name: '澳门', country: '中国', climate: 'tropical', pinyin: 'aomen', initial: 'A' },
  { name: '阿克苏', country: '中国', climate: 'desert', pinyin: 'akesu', initial: 'A' },
  { name: '阿拉善', country: '中国', climate: 'desert', pinyin: 'alashan', initial: 'A' },
  { name: '安庆', country: '中国', climate: 'temperate', pinyin: 'anqing', initial: 'A' },
  { name: '安阳', country: '中国', climate: 'temperate', pinyin: 'anyang', initial: 'A' },
  
  { name: '北京', country: '中国', climate: 'temperate', pinyin: 'beijing', initial: 'B' },
  { name: '包头', country: '中国', climate: 'temperate', pinyin: 'baotou', initial: 'B' },
  { name: '保定', country: '中国', climate: 'temperate', pinyin: 'baoding', initial: 'B' },
  { name: '北海', country: '中国', climate: 'tropical', pinyin: 'beihai', initial: 'B' },
  { name: '本溪', country: '中国', climate: 'cold', pinyin: 'benxi', initial: 'B' },
  { name: '滨州', country: '中国', climate: 'temperate', pinyin: 'binzhou', initial: 'B' },
  { name: '波士顿', country: '美国', climate: 'temperate', pinyin: 'bosidun', initial: 'B' },
  { name: '柏林', country: '德国', climate: 'temperate', pinyin: 'bolin', initial: 'B' },
  
  { name: '长春', country: '中国', climate: 'cold', pinyin: 'changchun', initial: 'C' },
  { name: '长沙', country: '中国', climate: 'temperate', pinyin: 'changsha', initial: 'C' },
  { name: '常州', country: '中国', climate: 'temperate', pinyin: 'changzhou', initial: 'C' },
  { name: '成都', country: '中国', climate: 'temperate', pinyin: 'chengdu', initial: 'C' },
  { name: '重庆', country: '中国', climate: 'temperate', pinyin: 'chongqing', initial: 'C' },
  { name: '潮州', country: '中国', climate: 'tropical', pinyin: 'chaozhou', initial: 'C' },
  { name: '承德', country: '中国', climate: 'cold', pinyin: 'chengde', initial: 'C' },
  { name: '沧州', country: '中国', climate: 'temperate', pinyin: 'cangzhou', initial: 'C' },
  { name: '赤峰', country: '中国', climate: 'cold', pinyin: 'chifeng', initial: 'C' },
  { name: '芝加哥', country: '美国', climate: 'temperate', pinyin: 'zhijiage', initial: 'Z' },
  
  { name: '大连', country: '中国', climate: 'cold', pinyin: 'dalian', initial: 'D' },
  { name: '东莞', country: '中国', climate: 'tropical', pinyin: 'dongguan', initial: 'D' },
  { name: '丹东', country: '中国', climate: 'cold', pinyin: 'dandong', initial: 'D' },
  { name: '大同', country: '中国', climate: 'temperate', pinyin: 'datong', initial: 'D' },
  { name: '大理', country: '中国', climate: 'temperate', pinyin: 'dali', initial: 'D' },
  { name: '大庆', country: '中国', climate: 'cold', pinyin: 'daqing', initial: 'D' },
  { name: '德州', country: '中国', climate: 'temperate', pinyin: 'dezhou', initial: 'D' },
  { name: '迪拜', country: '阿联酋', climate: 'desert', pinyin: 'dibai', initial: 'D' },
  
  { name: '鄂尔多斯', country: '中国', climate: 'desert', pinyin: 'eerduosi', initial: 'E' },
  { name: '恩施', country: '中国', climate: 'temperate', pinyin: 'enshi', initial: 'E' },
  
  { name: '佛山', country: '中国', climate: 'tropical', pinyin: 'foshan', initial: 'F' },
  { name: '福州', country: '中国', climate: 'tropical', pinyin: 'fuzhou', initial: 'F' },
  { name: '抚顺', country: '中国', climate: 'cold', pinyin: 'fushun', initial: 'F' },
  { name: '阜新', country: '中国', climate: 'cold', pinyin: 'fuxin', initial: 'F' },
  { name: '法兰克福', country: '德国', climate: 'temperate', pinyin: 'falanfuge', initial: 'F' },
  
  { name: '广州', country: '中国', climate: 'tropical', pinyin: 'guangzhou', initial: 'G' },
  { name: '贵阳', country: '中国', climate: 'temperate', pinyin: 'guiyang', initial: 'G' },
  { name: '桂林', country: '中国', climate: 'tropical', pinyin: 'guilin', initial: 'G' },
  { name: '赣州', country: '中国', climate: 'temperate', pinyin: 'ganzhou', initial: 'G' },
  { name: '高雄', country: '中国', climate: 'tropical', pinyin: 'gaoxiong', initial: 'G' },
  { name: '哈尔滨', country: '中国', climate: 'cold', pinyin: 'haerbin', initial: 'H' },
  
  { name: '海口', country: '中国', climate: 'tropical', pinyin: 'haikou', initial: 'H' },
  { name: '杭州', country: '中国', climate: 'temperate', pinyin: 'hangzhou', initial: 'H' },
  { name: '合肥', country: '中国', climate: 'temperate', pinyin: 'hefei', initial: 'H' },
  { name: '呼和浩特', country: '中国', climate: 'cold', pinyin: 'huhehaote', initial: 'H' },
  { name: '湖州', country: '中国', climate: 'temperate', pinyin: 'huzhou', initial: 'H' },
  { name: '邯郸', country: '中国', climate: 'temperate', pinyin: 'handan', initial: 'H' },
  { name: '惠州', country: '中国', climate: 'tropical', pinyin: 'huizhou', initial: 'H' },
  { name: '黄山', country: '中国', climate: 'temperate', pinyin: 'huangshan', initial: 'H' },
  { name: '汉堡', country: '德国', climate: 'temperate', pinyin: 'hanbao', initial: 'H' },
  
  { name: '济南', country: '中国', climate: 'temperate', pinyin: 'jinan', initial: 'J' },
  { name: '济宁', country: '中国', climate: 'temperate', pinyin: 'jining', initial: 'J' },
  { name: '佳木斯', country: '中国', climate: 'cold', pinyin: 'jiamusi', initial: 'J' },
  { name: '嘉兴', country: '中国', climate: 'temperate', pinyin: 'jiaxing', initial: 'J' },
  { name: '嘉峪关', country: '中国', climate: 'desert', pinyin: 'jiayuguan', initial: 'J' },
  { name: '荆州', country: '中国', climate: 'temperate', pinyin: 'jingzhou', initial: 'J' },
  { name: '金华', country: '中国', climate: 'temperate', pinyin: 'jinhua', initial: 'J' },
  { name: '九江', country: '中国', climate: 'temperate', pinyin: 'jiujiang', initial: 'J' },
  { name: '京都', country: '日本', climate: 'temperate', pinyin: 'jingdu', initial: 'J' },
  { name: '济州岛', country: '韩国', climate: 'temperate', pinyin: 'jizhoudao', initial: 'J' },
  { name: '金边', country: '柬埔寨', climate: 'tropical', pinyin: 'jinbian', initial: 'J' },
  
  { name: '开封', country: '中国', climate: 'temperate', pinyin: 'kaifeng', initial: 'K' },
  { name: '昆明', country: '中国', climate: 'tropical', pinyin: 'kunming', initial: 'K' },
  { name: '克拉玛依', country: '中国', climate: 'desert', pinyin: 'kelamayi', initial: 'K' },
  { name: '喀什', country: '中国', climate: 'desert', pinyin: 'kashi', initial: 'K' },
  { name: '开罗', country: '埃及', climate: 'desert', pinyin: 'kailuo', initial: 'K' },
  
  { name: '拉萨', country: '中国', climate: 'cold', pinyin: 'lasa', initial: 'L' },
  { name: '兰州', country: '中国', climate: 'temperate', pinyin: 'lanzhou', initial: 'L' },
  { name: '连云港', country: '中国', climate: 'temperate', pinyin: 'lianyungang', initial: 'L' },
  { name: '丽江', country: '中国', climate: 'temperate', pinyin: 'lijiang', initial: 'L' },
  { name: '临沂', country: '中国', climate: 'temperate', pinyin: 'linyi', initial: 'L' },
  { name: '柳州', country: '中国', climate: 'tropical', pinyin: 'liuzhou', initial: 'L' },
  { name: '洛阳', country: '中国', climate: 'temperate', pinyin: 'luoyang', initial: 'L' },
  { name: '伦敦', country: '英国', climate: 'temperate', pinyin: 'lundun', initial: 'L' },
  { name: '洛杉矶', country: '美国', climate: 'temperate', pinyin: 'luoshanji', initial: 'L' },
  
  { name: '马鞍山', country: '中国', climate: 'temperate', pinyin: 'maanshan', initial: 'M' },
  { name: '茂名', country: '中国', climate: 'tropical', pinyin: 'maoming', initial: 'M' },
  { name: '梅州', country: '中国', climate: 'tropical', pinyin: 'meizhou', initial: 'M' },
  { name: '绵阳', country: '中国', climate: 'temperate', pinyin: 'mianyang', initial: 'M' },
  { name: '马尔代夫', country: '马尔代夫', climate: 'tropical', pinyin: 'maerdaifu', initial: 'M' },
  { name: '曼谷', country: '泰国', climate: 'tropical', pinyin: 'mangu', initial: 'M' },
  { name: '墨尔本', country: '澳大利亚', climate: 'temperate', pinyin: 'moerben', initial: 'M' },
  { name: '慕尼黑', country: '德国', climate: 'temperate', pinyin: 'munich', initial: 'M' },
  
  { name: '南京', country: '中国', climate: 'temperate', pinyin: 'nanjing', initial: 'N' },
  { name: '南昌', country: '中国', climate: 'temperate', pinyin: 'nanchang', initial: 'N' },
  { name: '南宁', country: '中国', climate: 'tropical', pinyin: 'nanning', initial: 'N' },
  { name: '南通', country: '中国', climate: 'temperate', pinyin: 'nantong', initial: 'N' },
  { name: '宁波', country: '中国', climate: 'temperate', pinyin: 'ningbo', initial: 'N' },
  { name: '纽约', country: '美国', climate: 'temperate', pinyin: 'niuyue', initial: 'N' },
  { name: '名古屋', country: '日本', climate: 'temperate', pinyin: 'mingguwu', initial: 'M' },
  { name: '尼斯', country: '法国', climate: 'temperate', pinyin: 'nisi', initial: 'N' },
  
  { name: '攀枝花', country: '中国', climate: 'temperate', pinyin: 'panzhihua', initial: 'P' },
  { name: '盘锦', country: '中国', climate: 'cold', pinyin: 'panjin', initial: 'P' },
  { name: '蓬莱', country: '中国', climate: 'temperate', pinyin: 'penglai', initial: 'P' },
  { name: '莆田', country: '中国', climate: 'tropical', pinyin: 'putian', initial: 'P' },
  { name: '普吉岛', country: '泰国', climate: 'tropical', pinyin: 'pujidao', initial: 'P' },
  { name: '巴黎', country: '法国', climate: 'temperate', pinyin: 'bali', initial: 'B' },
  { name: '巴塞罗那', country: '西班牙', climate: 'temperate', pinyin: 'basailuona', initial: 'B' },
  { name: '普吉岛', country: '泰国', climate: 'tropical', pinyin: 'pujidao', initial: 'P' },
  
  { name: '青岛', country: '中国', climate: 'temperate', pinyin: 'qingdao', initial: 'Q' },
  { name: '秦皇岛', country: '中国', climate: 'temperate', pinyin: 'qinhuangdao', initial: 'Q' },
  { name: '齐齐哈尔', country: '中国', climate: 'cold', pinyin: 'qiqihaer', initial: 'Q' },
  { name: '泉州', country: '中国', climate: 'tropical', pinyin: 'quanzhou', initial: 'Q' },
  { name: '清迈', country: '泰国', climate: 'tropical', pinyin: 'qingmai', initial: 'Q' },
  
  { name: '日照', country: '中国', climate: 'temperate', pinyin: 'rizhao', initial: 'R' },
  { name: '日喀则', country: '中国', climate: 'cold', pinyin: 'rikaze', initial: 'R' },
  
  { name: '三亚', country: '中国', climate: 'tropical', pinyin: 'sanya', initial: 'S' },
  { name: '上海', country: '中国', climate: 'temperate', pinyin: 'shanghai', initial: 'S' },
  { name: '深圳', country: '中国', climate: 'tropical', pinyin: 'shenzhen', initial: 'S' },
  { name: '沈阳', country: '中国', climate: 'cold', pinyin: 'shenyang', initial: 'S' },
  { name: '石家庄', country: '中国', climate: 'temperate', pinyin: 'shijiazhuang', initial: 'S' },
  { name: '苏州', country: '中国', climate: 'temperate', pinyin: 'suzhou', initial: 'S' },
  { name: '绍兴', country: '中国', climate: 'temperate', pinyin: 'shaoxing', initial: 'S' },
  { name: '汕头', country: '中国', climate: 'tropical', pinyin: 'shantou', initial: 'S' },
  { name: '三明', country: '中国', climate: 'tropical', pinyin: 'sanming', initial: 'S' },
  { name: '首尔', country: '韩国', climate: 'cold', pinyin: 'shouer', initial: 'S' },
  { name: '新加坡', country: '新加坡', climate: 'tropical', pinyin: 'xinjiapo', initial: 'X' },
  { name: '悉尼', country: '澳大利亚', climate: 'temperate', pinyin: 'xini', initial: 'X' },
  
  { name: '台北', country: '中国', climate: 'tropical', pinyin: 'taibei', initial: 'T' },
  { name: '太原', country: '中国', climate: 'temperate', pinyin: 'taiyuan', initial: 'T' },
  { name: '唐山', country: '中国', climate: 'temperate', pinyin: 'tangshan', initial: 'T' },
  { name: '天津', country: '中国', climate: 'temperate', pinyin: 'tianjin', initial: 'T' },
  { name: '台州', country: '中国', climate: 'temperate', pinyin: 'taizhou', initial: 'T' },
  { name: '泰州', country: '中国', climate: 'temperate', pinyin: 'taizhou', initial: 'T' },
  { name: '吐鲁番', country: '中国', climate: 'desert', pinyin: 'tulufan', initial: 'T' },
  { name: '东京', country: '日本', climate: 'temperate', pinyin: 'dongjing', initial: 'D' },
  { name: '大阪', country: '日本', climate: 'temperate', pinyin: 'daban', initial: 'D' },
  
  { name: '乌鲁木齐', country: '中国', climate: 'cold', pinyin: 'wulumuqi', initial: 'W' },
  { name: '威海', country: '中国', climate: 'temperate', pinyin: 'weihai', initial: 'W' },
  { name: '温州', country: '中国', climate: 'tropical', pinyin: 'wenzhou', initial: 'W' },
  { name: '武汉', country: '中国', climate: 'temperate', pinyin: 'wuhan', initial: 'W' },
  { name: '无锡', country: '中国', climate: 'temperate', pinyin: 'wuxi', initial: 'W' },
  { name: '芜湖', country: '中国', climate: 'temperate', pinyin: 'wuhu', initial: 'W' },
  { name: '乌兰察布', country: '中国', climate: 'cold', pinyin: 'wulanchabu', initial: 'W' },
  
  { name: '厦门', country: '中国', climate: 'tropical', pinyin: 'xiamen', initial: 'X' },
  { name: '西安', country: '中国', climate: 'temperate', pinyin: 'xian', initial: 'X' },
  { name: '西宁', country: '中国', climate: 'cold', pinyin: 'xining', initial: 'X' },
  { name: '徐州', country: '中国', climate: 'temperate', pinyin: 'xuzhou', initial: 'X' },
  { name: '香港', country: '中国', climate: 'tropical', pinyin: 'xianggang', initial: 'X' },
  { name: '西双版纳', country: '中国', climate: 'tropical', pinyin: 'xishuangbanna', initial: 'X' },
  { name: '西雅图', country: '美国', climate: 'temperate', pinyin: 'xiyatu', initial: 'X' },
  
  { name: '烟台', country: '中国', climate: 'temperate', pinyin: 'yantai', initial: 'Y' },
  { name: '延安', country: '中国', climate: 'temperate', pinyin: 'yanan', initial: 'Y' },
  { name: '盐城', country: '中国', climate: 'temperate', pinyin: 'yancheng', initial: 'Y' },
  { name: '扬州', country: '中国', climate: 'temperate', pinyin: 'yangzhou', initial: 'Y' },
  { name: '宜昌', country: '中国', climate: 'temperate', pinyin: 'yichang', initial: 'Y' },
  { name: '银川', country: '中国', climate: 'desert', pinyin: 'yinchuan', initial: 'Y' },
  { name: '营口', country: '中国', climate: 'cold', pinyin: 'yingkou', initial: 'Y' },
  { name: '义乌', country: '中国', climate: 'temperate', pinyin: 'yiwu', initial: 'Y' },
  { name: ' Yokohama', country: '日本', climate: 'temperate', pinyin: 'yokohama', initial: 'Y' },
  { name: '耶路撒冷', country: '以色列', climate: 'desert', pinyin: 'yelusaleng', initial: 'Y' },
  
  { name: '张家界', country: '中国', climate: 'temperate', pinyin: 'zhangjiajie', initial: 'Z' },
  { name: '张家口', country: '中国', climate: 'cold', pinyin: 'zhangjiakou', initial: 'Z' },
  { name: '湛江', country: '中国', climate: 'tropical', pinyin: 'zhanjiang', initial: 'Z' },
  { name: '肇庆', country: '中国', climate: 'tropical', pinyin: 'zhaoqing', initial: 'Z' },
  { name: '郑州', country: '中国', climate: 'temperate', pinyin: 'zhengzhou', initial: 'Z' },
  { name: '中山', country: '中国', climate: 'tropical', pinyin: 'zhongshan', initial: 'Z' },
  { name: '珠海', country: '中国', climate: 'tropical', pinyin: 'zhuhai', initial: 'Z' },
  { name: '淄博', country: '中国', climate: 'temperate', pinyin: 'zibo', initial: 'Z' },
  { name: '舟山', country: '中国', climate: 'temperate', pinyin: 'zhoushan', initial: 'Z' },
  { name: '苏黎世', country: '瑞士', climate: 'cold', pinyin: 'sulishi', initial: 'S' },
  { name: '悉尼', country: '澳大利亚', climate: 'temperate', pinyin: 'xini', initial: 'X' },
  { name: '新加坡', country: '新加坡', climate: 'tropical', pinyin: 'xinjiapo', initial: 'X' },
  { name: '首尔', country: '韩国', climate: 'cold', pinyin: 'shouer', initial: 'S' },
  { name: '曼谷', country: '泰国', climate: 'tropical', pinyin: 'mangu', initial: 'M' },
  { name: '清迈', country: '泰国', climate: 'tropical', pinyin: 'qingmai', initial: 'Q' },
  { name: '普吉岛', country: '泰国', climate: 'tropical', pinyin: 'pujidao', initial: 'P' },
  { name: '巴厘岛', country: '印度尼西亚', climate: 'tropical', pinyin: 'balidao', initial: 'B' },
  { name: '东京', country: '日本', climate: 'temperate', pinyin: 'dongjing', initial: 'D' },
  { name: '大阪', country: '日本', climate: 'temperate', pinyin: 'daban', initial: 'D' },
  { name: '京都', country: '日本', climate: 'temperate', pinyin: 'jingdu', initial: 'J' },
  { name: '济州岛', country: '韩国', climate: 'temperate', pinyin: 'jizhoudao', initial: 'J' },
  { name: '巴黎', country: '法国', climate: 'temperate', pinyin: 'bali', initial: 'B' },
  { name: '伦敦', country: '英国', climate: 'temperate', pinyin: 'lundun', initial: 'L' },
  { name: '纽约', country: '美国', climate: 'temperate', pinyin: 'niuyue', initial: 'N' },
  { name: '洛杉矶', country: '美国', climate: 'temperate', pinyin: 'luoshanji', initial: 'L' },
  { name: '芝加哥', country: '美国', climate: 'temperate', pinyin: 'zhijiage', initial: 'Z' },
  { name: '悉尼', country: '澳大利亚', climate: 'temperate', pinyin: 'xini', initial: 'X' },
  { name: '墨尔本', country: '澳大利亚', climate: 'temperate', pinyin: 'moerben', initial: 'M' },
  { name: '迪拜', country: '阿联酋', climate: 'desert', pinyin: 'dibai', initial: 'D' },
  { name: '瑞士', country: '瑞士', climate: 'cold', pinyin: 'ruishi', initial: 'R' },
  { name: '冰岛', country: '冰岛', climate: 'cold', pinyin: 'bingdao', initial: 'B' },
  { name: '新西兰', country: '新西兰', climate: 'temperate', pinyin: 'xinxilan', initial: 'X' },
  { name: '加拿大', country: '加拿大', climate: 'cold', pinyin: 'jianada', initial: 'J' },
];

export function getDestinationsGroupedByInitial(): Record<string, DestinationWithPinyin[]> {
  const grouped: Record<string, DestinationWithPinyin[]> = {};
  
  destinations.forEach(dest => {
    const initial = dest.initial;
    if (!grouped[initial]) {
      grouped[initial] = [];
    }
    grouped[initial].push(dest);
  });
  
  Object.keys(grouped).forEach(key => {
    grouped[key].sort((a, b) => a.pinyin.localeCompare(b.pinyin));
  });
  
  return grouped;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}