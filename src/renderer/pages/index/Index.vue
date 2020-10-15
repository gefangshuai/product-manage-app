<template>
    <admin-layout>
        <div slot="header" class="flex-space-between">
            <h3>
                商品列表 （共 {{ totalCount }} 条记录）
            </h3>
            <div>
                <a-input-search v-model="keyword" style="width: 300px;" placeholder="搜索 名称 / 主条码"
                                @search="handleSearch"/>
                <a-upload name="file"
                          :show-upload-list="false"
                          :multiple="false"
                          :before-upload="beforeUpload">
                    <a-button type="primary"
                              :loading="loading"
                              icon="upload">批量导入
                    </a-button>
                </a-upload>
<!--                <a-button>批量删除</a-button>-->
                <a-button type="primary" @click="priceSearch">价格查询</a-button>
                <a-button @click="openDev">调试</a-button>
            </div>
        </div>
        <s-table :config="{dataSource: data, pagination: false}"
                 :offset-height="60"
                 auto-height>
            <s-table-column title="#" :width="80">
                <template slot-scope="{index}">
                    {{ (currentPage - 1) * 10 + index + 1 }}
                </template>
            </s-table-column>
            <s-table-column title="自编号" prop="key" :width="200"></s-table-column>
            <s-table-column title="条码" prop="code" :width="200"></s-table-column>
            <s-table-column title="书籍名称" prop="name">
                <template slot-scope="{text}">
                    <span style="font-weight: bold">{{ text }}</span>
                </template>
            </s-table-column>
            <s-table-column title="定价（元）" prop="price" :width="120"></s-table-column>
            <s-table-column title="零售折扣" prop="discount" :width="100"></s-table-column>
            <s-table-column title="折后价（元）" prop="sellPrice" :width="120">
                <template slot-scope="{text}">
                    <span style="font-weight: bold;">{{ text }}</span>
                </template>
            </s-table-column>
        </s-table>
        <div slot="footer">
            <a-pagination v-model="currentPage" :total="totalCount" @change="handlePageChange"/>
        </div>
        <a-modal v-model="priceSearchVisible"
                 :mask-closable="false"
                 :footer="null"
                 title="扫描商品，查询价格">
            <price-search v-if="priceSearchVisible"/>
        </a-modal>
    </admin-layout>
</template>

<script>
    import AdminLayout from "../../components/layout/AdminLayout";
    import XLSX from 'xlsx'
    import STable from "../../components/table/STable";
    import STableColumn from "../../components/table/STableColumn";
    import PriceSearch from "./PriceSearchModal";
    import {remote} from 'electron'

    const columns = [
        {title: '自编号', dataIndex: 'key', key: 'key', width: 200},
        {title: '条码', dataIndex: 'code', key: 'code', width: 200},
        {title: '书籍名称', dataIndex: 'name', key: 'name'},
        {title: '定价', dataIndex: 'price', key: 'price', width: 100},
        {title: '零售折扣', dataIndex: 'discount', key: 'discount', width: 100},
        {title: '折后价', dataIndex: 'sellPrice', key: 'sellPrice', width: 100},
    ];

    export default {
        name: "Index",
        components: {PriceSearch, STableColumn, STable, AdminLayout},
        data() {
            return {
                currentPage: 1,
                data: [],
                columns,
                loading: false,
                scrollY: 0,
                currentCode: '',
                priceSearchVisible: false,
                totalCount: 0,
                keyword: ''
            };
        },
        created() {
            this.loadData()
        },
        mounted() {
        },
        methods: {
            loadData() {
                let query = {
                    name: {
                        $regex: new RegExp(`${this.keyword}`)
                    }
                }
                console.log('query', query)
                this.$db.find(query).sort({key: 1}).skip((this.currentPage - 1) * 10).limit(10).exec((err, docs) => {
                    this.data = docs
                })
                this.$db.count(query).exec((err, count) => {
                    this.totalCount = count
                })
            },
            findByKey(key) {
                return this.$db.findOne({key: key})
            },
            beforeUpload(file) {
                try {
                    this.loading = true
                    let workbook = XLSX.readFile(file.path);
                    let sheetName = workbook.SheetNames[0]
                    let sheet = workbook.Sheets[sheetName]
                    let data = XLSX.utils.sheet_to_json(sheet)
                    data.forEach((item, index) => {
                        let product = {
                            key: item['自编号'],
                            code: item['条码'],
                            name: item['书籍名称'],
                            price: item['定价'],
                            discount: item['零售折扣'],
                            sellPrice: item['折后价']
                        }
                        console.log(index, product)
                        this.saveOrUpdate(product)
                        if(data.length === index + 1) {
                            this.loading = false
                            this.$message.success('导入成功！')
                            location.reload()
                        }
                    })
                   
                } catch (e) {
                    this.$nextTick(_ => {
                        this.$message.error('导入失败，请重试！')
                        this.loading = false
                    })
                }
                return false;
            },
            updateProduct(id, project) {
                console.log('数据重复，更新：', project)
                this.$db.update({_id: id}, project, {}, (err, numReplaced) => {
                    this.loadData()
                })
            },
            saveProduct(product) {
                this.$db.insert(product, (err, doc) => {
                    this.loadData()
                })
            },
            saveOrUpdate(product) {
                console.log('save', product)
                //商品名称	主条码	单位	进价	零售价	备注
                this.findByKey(product.key).exec((err, doc) => {
                    if (doc) {
                        this.updateProduct(doc._id, product)
                    } else {
                        this.saveProduct(product)
                    }
                })

            },
            priceSearch() {
                this.priceSearchVisible = true
            },
            handlePageChange(page) {
                this.currentPage = page
                this.loadData()
            },
            handleSearch() {
                this.loadData()
            },
            openDev() {
                remote.getCurrentWebContents().openDevTools()
            }
        },
        beforeDestroy() {
        }
    }
</script>

<style scoped>

</style>