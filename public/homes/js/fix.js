app.directive('maxlength',function(){
    return {
        rectire:'A',
        link:function(scope,elem,attrs){
            var maxLength = attrs['maxlength'];
            maxLength = isNaN(maxLength) ? 0 : parseInt(maxLength);
            function testLength() {
              if(this.value.length > maxLength) {
                this.value = this.value.substring(0, maxLength);
              }
            }
            elem.on("change",testLength);
            elem.on("keyup",testLength);
            elem.on("paste",testLength);
        }
    }
})