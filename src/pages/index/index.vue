<style lang='less'>
body,
html {
    margin: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #000;
}
#canvas {
    position: absolute;
    width: 100%;
    height: 100%;
}
</style>
<template>
<div>
  <canvas id="canvas"></canvas>
</div>
</template>
<script>
export default {
  data() {
    return {
      size: ''
    }
  },
  methods: {
    project3D(x, y, z, vars) {
      var p, d
      x -= vars.camX
      y -= vars.camY - 8
      z -= vars.camZ
      p = Math.atan2(x, z)
      d = Math.sqrt(x * x + z * z)
      x = Math.sin(p - vars.yaw) * d
      z = Math.cos(p - vars.yaw) * d
      p = Math.atan2(y, z)
      d = Math.sqrt(y * y + z * z)
      y = Math.sin(p - vars.pitch) * d
      z = Math.cos(p - vars.pitch) * d
      var rx1 = -1000
      var ry1 = 1
      var rx2 = 1000
      var ry2 = 1
      var rx3 = 0
      var ry3 = 0
      var rx4 = x
      var ry4 = z
      var uc = (ry4 - ry3) * (rx2 - rx1) - (rx4 - rx3) * (ry2 - ry1)
      var ua = ((rx4 - rx3) * (ry1 - ry3) - (ry4 - ry3) * (rx1 - rx3)) / uc
      var ub = ((rx2 - rx1) * (ry1 - ry3) - (ry2 - ry1) * (rx1 - rx3)) / uc
      if (!z) z = 0.000000001
      if (ua > 0 && ua < 1 && ub > 0 && ub < 1) {
        return {
          x: vars.cx + (rx1 + ua * (rx2 - rx1)) * vars.scale,
          y: vars.cy + y / z * vars.scale,
          d: (x * x + y * y + z * z)
        }
      } else {
        return {
          d: -1
        }
      }
    },
    elevation(x, y, z) {
      var dist = Math.sqrt(x * x + y * y + z * z)
      if (dist && z / dist >= -1 && z / dist <= 1) return Math.acos(z / dist)
      return 0.00000001
    },
    rgb(col) {
      col += 0.000001
      var r = parseInt((0.5 + Math.sin(col) * 0.5) * 16)
      var g = parseInt((0.5 + Math.cos(col) * 0.5) * 16)
      var b = parseInt((0.5 - Math.sin(col) * 0.5) * 16)
      return '#' + r.toString(16) + g.toString(16) + b.toString(16)
    },
    interpolateColors(RGB1, RGB2, degree) {
      var w2 = degree
      var w1 = 1 - w2
      return [w1 * RGB1[0] + w2 * RGB2[0], w1 * RGB1[1] + w2 * RGB2[1], w1 * RGB1[2] + w2 * RGB2[2]]
    },
    rgbArray(col) {
      col += 0.000001
      var r = parseInt((0.5 + Math.sin(col) * 0.5) * 256)
      var g = parseInt((0.5 + Math.cos(col) * 0.5) * 256)
      var b = parseInt((0.5 - Math.sin(col) * 0.5) * 256)
      return [r, g, b]
    },
    colorString(arr) {
      var r = parseInt(arr[0])
      var g = parseInt(arr[1])
      var b = parseInt(arr[2])
      return '#' + ('0' + r.toString(16)).slice(-2) + ('0' + g.toString(16)).slice(-2) + ('0' + b.toString(16)).slice(-2);
    },
    process(vars) {
      if (vars.points.length < vars.initParticles) {
        for (var j = 0; j < 5; ++j) {
          this.spawnParticle(vars)
        }
      }
      var p, d, t
      p = Math.atan2(vars.camX, vars.camZ)
      d = Math.sqrt(vars.camX * vars.camX + vars.camZ * vars.camZ)
      d -= Math.sin(vars.frameNo / 80) / 25
      t = Math.cos(vars.frameNo / 300) / 165
      vars.camX = Math.sin(p + t) * d
      vars.camZ = Math.cos(p + t) * d
      vars.camY = -Math.sin(vars.frameNo / 220) * 15
      vars.yaw = Math.PI + p + t
      vars.pitch = this.elevation(vars.camX, vars.camZ, vars.camY) - Math.PI / 2
      for (var i = 0; i < vars.points.length; ++i) {
        var x = vars.points[i].x
        //var y = vars.points[i].y
        var z = vars.points[i].z
        d = Math.sqrt(x * x + z * z) / 1.0075
        t = 0.1 / (1 + d * d / 5)
        p = Math.atan2(x, z) + t
        vars.points[i].x = Math.sin(p) * d
        vars.points[i].z = Math.cos(p) * d
        vars.points[i].y += vars.points[i].vy * t * ((Math.sqrt(vars.distributionRadius) - d) * 2)
        if (vars.points[i].y > vars.vortexHeight / 2 || d < 0.25) {
          vars.points.splice(i, 1)
          this.spawnParticle(vars)
        }
      }
    },
    drawFloor(vars) {
      var x, y, z, d, point, a
      for (var i = -25; i <= 25; i += 1) {
        for (var j = -25; j <= 25; j += 1) {
          x = i * 2
          z = j * 2
          y = vars.floor
          d = Math.sqrt(x * x + z * z)
          point = this.project3D(x, y - d * d / 85, z, vars)
          if (point.d !== -1) {
            this.size = 1 + 15000 / (1 + point.d)
            a = 0.15 - Math.pow(d / 50, 4) * 0.15
            if (a > 0) {
              vars.ctx.fillStyle = this.colorString(this.interpolateColors(this.rgbArray(d / 26 - vars.frameNo / 40), [0, 128, 32], 0.5 + Math.sin(d / 6 - vars.frameNo / 8) / 2))
              vars.ctx.globalAlpha = a
              vars.ctx.fillRect(point.x - this.size / 2, point.y - this.size / 2, this.size, this.size)
            }
          }
        }
      }
      vars.ctx.fillStyle = '#82f'
      for (var s = -25; s <= 25; s += 1) {
        for (var k = -25; k <= 25; k += 1) {
          x = s * 2
          z = k * 2
          y = -vars.floor
          d = Math.sqrt(x * x + z * z)
          point = this.project3D(x, y + d * d / 85, z, vars)
          if (point.d !== -1) {
            this.size = 1 + 15000 / (1 + point.d)
            a = 0.15 - Math.pow(d / 50, 4) * 0.15
            if (a > 0) {
              vars.ctx.fillStyle = this.colorString(this.interpolateColors(this.rgbArray(-d / 26 - vars.frameNo / 40), [32, 0, 128], 0.5 + Math.sin(-d / 6 - vars.frameNo / 8) / 2))
              vars.ctx.globalAlpha = a
              vars.ctx.fillRect(point.x - this.size / 2, point.y - this.size / 2, this.size, this.size)
            }
          }
        }
      }
    },
    sortFunction(a, b) {
      return b.dist - a.dist
    },
    draw(vars) {
      vars.ctx.globalAlpha = 0.15
      vars.ctx.fillStyle = '#000'
      vars.ctx.fillRect(0, 0, document.getElementById('canvas').width, document.getElementById('canvas').height)
      this.drawFloor(vars)
      var point, x, y, z, a, d
      for (var i = 0; i < vars.points.length; ++i) {
        x = vars.points[i].x
        y = vars.points[i].y
        z = vars.points[i].z
        point = this.project3D(x, y, z, vars)
        if (point.d !== -1) {
          vars.points[i].dist = point.d
          this.size = 1 + vars.points[i].radius / (1 + point.d)
          d = Math.abs(vars.points[i].y)
          a = 0.8 - Math.pow(d / (vars.vortexHeight / 2), 1000) * 0.8
          vars.ctx.globalAlpha = a >= 0 && a <= 1 ? a : 0
          vars.ctx.fillStyle = this.rgb(vars.points[i].color)
          if (point.x > -1 && point.x < vars.canvas.width && point.y > -1 && point.y < vars.canvas.height) vars.ctx.fillRect(point.x - this.size / 2, point.y - this.size / 2, this.size, this.size)
        }
      }
      vars.points.sort(this.sortFunction)
    },
    spawnParticle(vars) {
      var p, ls, pt
      pt = {}
      p = Math.PI * 2 * Math.random()
      ls = Math.sqrt(Math.random() * vars.distributionRadius)
      pt.x = Math.sin(p) * ls
      pt.y = -vars.vortexHeight / 2
      pt.vy = vars.initV / 20 + Math.random() * vars.initV
      pt.z = Math.cos(p) * ls
      pt.radius = 200 + 800 * Math.random()
      pt.color = pt.radius / 1000 + vars.frameNo / 250
      vars.points.push(pt)
    },
    frame(vars) {
      if (vars === undefined) {
        vars = {}
        vars.canvas = document.querySelector('canvas')
        vars.ctx = vars.canvas.getContext('2d')
        vars.canvas.width = document.body.clientWidth
        vars.canvas.height = document.body.clientHeight
        window.addEventListener('resize', function() {
          vars.canvas.width = document.body.clientWidth
          vars.canvas.height = document.body.clientHeight
          vars.cx = vars.canvas.width / 2
          vars.cy = vars.canvas.height / 2
        }, true)
        vars.frameNo = 0
        vars.camX = 0
        vars.camY = 0
        vars.camZ = -14
        vars.pitch = this.elevation(vars.camX, vars.camZ, vars.camY) - Math.PI / 2
        vars.yaw = 0
        vars.cx = vars.canvas.width / 2
        vars.cy = vars.canvas.height / 2
        vars.bounding = 10
        vars.scale = 500
        vars.floor = 26.5
        vars.points = []
        vars.initParticles = 700
        vars.initV = 0.01
        vars.distributionRadius = 800
        vars.vortexHeight = 25
      }
      vars.frameNo++
      requestAnimationFrame(() => {
        this.frame(vars)
      })
      this.process(vars)
      this.draw(vars)
    }
  },
  mounted() {
    this.frame()
  }
}
</script>
