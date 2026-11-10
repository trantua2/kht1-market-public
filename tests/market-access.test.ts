import {describe,expect,it} from "vitest";
import {isNormalOption,projectMarketPage} from "../lib/market-access";

const snapshot={published_at:"2026-11-10T00:00:00Z",shop_count:2,item_count:3,snapshots:{"Biện Kinh":"2026-11-10T00:00:00Z"},shops:[
  {owner_name:"A",shop_name:"Sạp A",map_name:"Biện Kinh",x:1,y:2,items:[
    {name:"Nhẫn A",price:100,currency:"coin",element:"Kim",level:5,options:[{label:"Sinh khí",value:10,unit:"point"},{label:"Tốc độ đánh ngoại công",value:20,unit:"percent"}]},
    {name:"Nhẫn B",price:200,currency:"coin",element:"Mộc",level:6,options:[{label:"Thời gian làm choáng",value:-30,unit:"percent"}]},
  ]},
  {owner_name:"B",shop_name:"Sạp B",map_name:"Tương Dương",x:3,y:4,items:[
    {name:"Hạng liên",price:3,currency:"silver",element:"Thủy",level:7,options:[{label:"Nhãn mới chưa duyệt",value:999,unit:"point"}]},
  ]},
]};

describe("secure market projection",()=>{
  it("allows Dã Tẩu options and fails closed for hunting or unknown labels",()=>{
    for(const label of ["Sinh khí","Thể lực tối đa","Thời gian làm chậm","Thời gian làm choáng","Thời gian trúng độc","Kháng hỏa","Phòng thủ vật lý","Phục hồi sinh lực mỗi nửa giây"]){
      expect(isNormalOption(label),label).toBe(true);
    }
    for(const label of ["Tốc độ đánh ngoại công","Tốc độ di chuyển","Sát thương vật lý ngoại công","May mắn","Nhãn mới chưa duyệt"]){
      expect(isNormalOption(label),label).toBe(false);
    }
  });

  it("removes locked values from Normal responses",()=>{
    const page=projectMarketPage(snapshot,{fullOptions:false,limit:100});
    expect(page.shops[0].items[0].options).toEqual([{label:"Sinh khí",value:10,unit:"point"}]);
    expect(page.shops[0].items[0].locked_option_count).toBe(1);
    expect(JSON.stringify(page)).not.toContain("Tốc độ đánh ngoại công");
    expect(JSON.stringify(page)).not.toContain("999");
  });

  it("returns complete values to Plus responses",()=>{
    const page=projectMarketPage(snapshot,{fullOptions:true,limit:100});
    expect(page.shops[0].items[0].options).toHaveLength(2);
    expect(page.shops[1]!.items[0]!.options![0]!.value).toBe(999);
  });

  it("filters on the server and groups a bounded page by shop",()=>{
    const first=projectMarketPage(snapshot,{fullOptions:false,query:"nhẫn",city:"Biện Kinh",limit:1});
    expect(first.total_items).toBe(2);
    expect(first.shops).toHaveLength(1);
    expect(first.shops[0].items).toHaveLength(1);
    expect(first.next_cursor).toBe("1");
    const second=projectMarketPage(snapshot,{fullOptions:false,query:"nhẫn",city:"Biện Kinh",limit:100,cursor:first.next_cursor});
    expect(second.shops[0].items[0].name).toBe("Nhẫn B");
    expect(second.next_cursor).toBeNull();
  });

  it("does not allow Normal users to filter by locked option labels",()=>{
    expect(projectMarketPage(snapshot,{fullOptions:false,option:"Tốc độ đánh ngoại công",limit:100}).total_items).toBe(0);
    expect(projectMarketPage(snapshot,{fullOptions:true,option:"Tốc độ đánh ngoại công",limit:100}).total_items).toBe(1);
  });

  it("caps pages at one hundred items",()=>{
    expect(()=>projectMarketPage(snapshot,{fullOptions:true,limit:101})).toThrow("limit");
    expect(()=>projectMarketPage(snapshot,{fullOptions:true,limit:100,min:Number.NaN})).toThrow("Bộ lọc số");
  });
});
