function ModelSurface() {
    this.iVertexBuffer = gl.createBuffer();
    this.iTexCoordBuffer = gl.createBuffer();
    this.iFillIndexBuffer = null;

    this.vertexList = [];
    this.texCoordList = [];
    this.fillIndices = [];

    this.uLineCount = 0;
    this.pointsPerULine = 0;
    this.vLineCount = 0;
    this.pointsPerVLine = 0;

    this.fillVertexCount = 0;
    this.fillIndexCount = 0;

    this.CreateSurfaceData = function() {
        const a = 1.5;      // Радіус
        const b = 1.2;      // Висота
        const scale = 1.0;

        const du = 1.0 / 60;
        const dv = Math.PI / 60;

        this.vertexList = [];
        this.texCoordList = [];
        this.fillIndices = [];

        let uCount = Math.floor(1.0 / du) + 1;
        let vCount = Math.floor((2 * Math.PI) / dv) + 1;

        this.uLineCount = vCount;
        this.pointsPerULine = uCount;

        // Верхня півсфера
        for (let v = 0; v <= 2 * Math.PI + 0.0001; v += dv) {
            for (let u = 0; u <= 1.0 + 0.0001; u += du) {
                const x = scale * a * u * Math.cos(v);
                const y = scale * a * u * Math.sin(v);
                const z = scale * b * (1 - u * u); // верх
                this.vertexList.push(x, y, z);

                const uTex = v / (2 * Math.PI);
                const vTex = u;
                this.texCoordList.push(uTex, vTex);
            }
        }

        // Нижня півсфера (дзеркальна копія)
        for (let v = 0; v <= 2 * Math.PI + 0.0001; v += dv) {
            for (let u = 0; u <= 1.0 + 0.0001; u += du) {
                const x = scale * a * u * Math.cos(v);
                const y = scale * a * u * Math.sin(v);
                const z = -scale * b * (1 - u * u); // низ
                this.vertexList.push(x, y, z);

                const uTex = v / (2 * Math.PI);
                const vTex = u;
                this.texCoordList.push(uTex, vTex);
            }
        }

        const upperOffset = 0;
        const lowerOffset = this.uLineCount * this.pointsPerULine;

        // Індекси для верхньої півсфери
        for (let i = 0; i < this.uLineCount - 1; i++) {
            for (let j = 0; j < this.pointsPerULine - 1; j++) {
                const idx = upperOffset + i * this.pointsPerULine + j;
                this.fillIndices.push(idx, idx + this.pointsPerULine, idx + 1);
                this.fillIndices.push(idx + this.pointsPerULine, idx + this.pointsPerULine + 1, idx + 1);
            }
        }

        // Індекси для нижньої півсфери
        for (let i = 0; i < this.uLineCount - 1; i++) {
            for (let j = 0; j < this.pointsPerULine - 1; j++) {
                const idx = lowerOffset + i * this.pointsPerULine + j;
                this.fillIndices.push(idx, idx + this.pointsPerULine, idx + 1);
                this.fillIndices.push(idx + this.pointsPerULine, idx + this.pointsPerULine + 1, idx + 1);
            }
        }

        this.fillVertexCount = this.vertexList.length / 3;
        this.fillIndexCount = this.fillIndices.length;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertexList), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iTexCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texCoordList), gl.STATIC_DRAW);

        this.iFillIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iFillIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.fillIndices), gl.STATIC_DRAW);
    };

    this.Draw = function() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribVertex);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iTexCoordBuffer);
        gl.vertexAttribPointer(shProgram.iAttribTexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribTexCoord);

        // Верхні лінії
        for (let i = 0; i < this.uLineCount; i++) {
            gl.drawArrays(gl.LINE_STRIP, i * this.pointsPerULine, this.pointsPerULine);
        }

        // Нижні лінії
        let lowerOffset = this.uLineCount * this.pointsPerULine;
        for (let i = 0; i < this.uLineCount; i++) {
            gl.drawArrays(gl.LINE_STRIP, lowerOffset + i * this.pointsPerULine, this.pointsPerULine);
        }
    };

    this.DrawFilled = function() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribVertex);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iTexCoordBuffer);
        gl.vertexAttribPointer(shProgram.iAttribTexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribTexCoord);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iFillIndexBuffer);
        gl.drawElements(gl.TRIANGLES, this.fillIndexCount, gl.UNSIGNED_SHORT, 0);
    };
}
