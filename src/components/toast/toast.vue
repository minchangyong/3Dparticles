<style lang="less" scoped>
.q-toast {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1000000;
    width: 100%;
    height: 100%;
    display: -webkit-box;
    -webkit-box-orient: horizontal;
    -webkit-box-pack: center;
    -webkit-box-align: center;
    .q-toast-text {
        min-width: 100px;
        max-width: 80%;
        margin: 0 auto;
        text-align: center;
        padding: 13px 24px;
        line-height: 1.42857143;
        font-size: 24px;
        color: #FFFFFF;
        opacity: 0.8;
        background: #1A1B1B;
        box-shadow: 4px 4px 16px 8px rgba(67,72,81,0.10);
        border-radius: 6px;
    }
}
.q-toast-pop-transition {
    transition: opacity 0.3s linear;
}
.q-toast-pop-enter,
.q-toast-pop-leave {
    opacity: 0;
}
</style>

<template>
<div class="q-toast" transition="q-toast-pop">
    <div class="q-toast-text">{{ message }}</div>
</div>
</template>

<script>
export default {
    props: {
        message: String,
        default: ''
    }
}
</script>
