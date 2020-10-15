<template>
    <div>
        <div>
            <a-input-search v-model="code" ref="inpRef" @blur="handleBlur" @search="handleSearch"/>
        </div>

        <div>
            <div v-if="products.length === 0" class="text-danger margin-top text-center">
                扫码时请不要将当前窗口关闭！
            </div>
            <div v-for="product in products" class="margin-top text-center" style="font-size: 18px;">
                <a-divider/>
                <span style="color: dodgerblue">
                    {{product.name}}：
                </span>
                <span style="font-size: 48px; color: red; font-weight: bold;">{{product.sellPrice}}</span>
                <span>元</span>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "PriceSearch",
        data() {
            return {
                code: '',
                products: []
            }
        },
        mounted() {
            this.handleFocus()
        },
        methods: {
            handleFocus() {
                this.$nextTick(_ => {
                    this.$refs['inpRef']? this.$refs['inpRef'].focus(): null
                })
            },
            handleBlur() {
                this.$nextTick(_ => {
                    this.handleFocus()
                })
            },
            handleSearch() {
                console.log(this.code)
                this.$db.find({code: this.code}, {}, (err, docs) => {
                    this.products = docs
                })
            }
        }
    }
</script>

<style scoped>

</style>