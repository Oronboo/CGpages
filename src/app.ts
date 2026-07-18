import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

class ThreeJSContainer {

    private scene!: THREE.Scene;
    private light!: THREE.Light;

    // 泡
    private cloud!: THREE.Points;
    private particleSpeed: THREE.Vector3[] = [];

    // 魚
    private fishes: THREE.Points[] = [];
    private fishSpeed: THREE.Vector3[] = [];

    private glowTorii!: THREE.Group;

    private stars!: THREE.Points;
    private starSpeed!: THREE.Vector3[];

    private starTrail!: THREE.LineSegments;

    private audienceLights!: THREE.Points;

    constructor() { }

    // レンダラー作成
    public createRendererDOM = (
        width: number,
        height: number,
        cameraPos: THREE.Vector3
    ) => {

        const renderer = new THREE.WebGLRenderer();

        renderer.setSize(width, height);
        renderer.setClearColor(new THREE.Color(0x000000));
        renderer.shadowMap.enabled = true;

        const camera = new THREE.PerspectiveCamera(
            75,
            width / height,
            0.1,
            1000
        );

        camera.position.copy(cameraPos);
        camera.lookAt(0, 0, 0);

        const orbitControls = new OrbitControls(
            camera,
            renderer.domElement
        );

        this.createScene();

        const render: FrameRequestCallback = () => {

            orbitControls.update();

            renderer.render(this.scene, camera);

            requestAnimationFrame(render);
        };

        requestAnimationFrame(render);

        renderer.domElement.style.cssFloat = "left";
        renderer.domElement.style.margin = "10px";

        return renderer.domElement;
    };

    //----------------------------------------------------
    // 泡生成
    //----------------------------------------------------

    private createBubbleParticles() {

        const geometry = new THREE.BufferGeometry();

        const texture = new THREE.TextureLoader().load(
            "./bable.png"
        );

        const material = new THREE.PointsMaterial({
            size: 2.0,
            map: texture,
            blending: THREE.AdditiveBlending,
            color: 0xffffff,
            depthWrite: false,
            transparent: true,
            opacity: 0.7
        });

        const particleNum = 3000;

        const positions = new Float32Array(
            particleNum * 3
        );

        this.particleSpeed = [];

        let index = 0;

        for (let i = 0; i < particleNum; i++) {

            let x, y, z;
            let dx, dz;

            do {

                x = Math.random() * 180 - 90;
                y = Math.random() * 120 - 20;
                z = Math.random() * 180 - 90;

                dx = x;
                dz = z - 10;

            } while (
                dx * dx + dz * dz < 30 * 30 ||
                dx * dx + dz * dz > 90 * 90
            );

            positions[index++] = x;
            positions[index++] = y;
            positions[index++] = z;

            this.particleSpeed.push(
                new THREE.Vector3(
                    0,
                    Math.random() * 10 + 0.2
                )
            );
        }

        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(
                positions,
                3
            )
        );

        this.cloud = new THREE.Points(
            geometry,
            material
        );

        this.scene.add(this.cloud);
    }

    //----------------------------------------------------
    // 魚生成
    //----------------------------------------------------

    private createFishParticles(texturePath: string): THREE.Points {

        const geometry = new THREE.BufferGeometry();

        const texture =
            new THREE.TextureLoader().load(texturePath);

        const material = new THREE.PointsMaterial({

            size: 5,
            map: texture,
            blending: THREE.AdditiveBlending,
            color: 0xffffff,
            depthWrite: false,
            transparent: true,
            opacity: 0.7

        });

        const particleNum = 500;

        const positions = new Float32Array(
            particleNum * 3
        );

        let index = 0;

        for (let i = 0; i < particleNum; i++) {

            let x, y, z;
            let dx, dz;

            do {

                x = Math.random() * 180 - 90;
                y = Math.random() * 180 - 90;
                z = Math.random() * 180 - 90;

                dx = x;
                dz = z - 10;

            } while (
                dx * dx + dz * dz < 30 * 30 ||
                dx * dx + dz * dz > 90 * 90
            );

            positions[index++] = x;
            positions[index++] = y;
            positions[index++] = z;

            this.fishSpeed.push(
                new THREE.Vector3(
                    0,
                    -Math.random() * 2 - 0.1
                )
            );
        }

        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(
                positions,
                3
            )
        );

        return new THREE.Points(
            geometry,
            material
        );
    }

    //----------------------------------------------------
    // 観客（客席に沿った光）
    //----------------------------------------------------

    private createAudienceLights(color: number) {

        const geometry = new THREE.BufferGeometry();


        const audienceNum = 2000;

        const positions =
            new Float32Array(audienceNum * 3);


        let index = 0;


        for (let i = 0; i < audienceNum; i++) {


            // 円周方向
            const angle =
                Math.random() * Math.PI * 2;


            // 半径
            const radius =
                80 + Math.random() * 20;


            // 円柱の高さ方向
            // 外側ほど高くする
            const y =
                ((radius - 80) / 20) * 20
                +
                Math.random() * 2
                - 20;


            const x =
                Math.cos(angle) * radius;


            const z =
                Math.sin(angle) * radius + 10;


            positions[index++] = x;
            positions[index++] = y;
            positions[index++] = z;

        }


        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(
                positions,
                3
            )
        );


        const material =
            new THREE.PointsMaterial({

                size: 1.0,
                opacity: 1.0,
                blending: THREE.AdditiveBlending,
                color: color,



                map: this.generateAudienceSprite(),

                transparent: true,

                depthWrite: false

            });

        this.audienceLights =
            new THREE.Points(
                geometry,
                material
            );


        this.scene.add(
            this.audienceLights
        );

    }

    private generateAudienceSprite = () => {

        const canvas = document.createElement('canvas');

        canvas.width = 32;
        canvas.height = 32;


        const context = canvas.getContext('2d')!;


        const gradient =
            context.createRadialGradient(
                16,
                16,
                0,
                16,
                16,
                16
            );


        gradient.addColorStop(
            0,
            "rgba(255,255,255,1)"
        );


        gradient.addColorStop(
            0.3,
            "rgba(120,220,255,1)"
        );


        gradient.addColorStop(
            0.7,
            "rgba(80,180,255,0.5)"
        );


        gradient.addColorStop(
            1,
            "rgba(0,0,0,0)"
        );


        context.fillStyle = gradient;

        context.fillRect(
            0,
            0,
            32,
            32
        );


        const texture = new THREE.Texture(canvas);

        texture.needsUpdate = true;


        return texture;

    }
    //----------------------------------------------------
    // シーン作成
    //----------------------------------------------------

    private createScene = () => {

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1e3a5f);

        const waterMaterial = new THREE.MeshPhongMaterial({
            color: 0x006994,       // 海の青
            transparent: true,
            opacity: 0.7,
            shininess: 100,        // 光沢
            side: THREE.DoubleSide
        });

        const planeGeometry = new THREE.PlaneGeometry(200, 200);

        const planeMesh = new THREE.Mesh(
            planeGeometry,
            waterMaterial
        );

        planeMesh.rotateX(-Math.PI / 2);
        planeMesh.position.y = -20;

        this.scene.add(planeMesh);


        this.scene.add(planeMesh);

        // 泡生成
        this.createBubbleParticles();

        // 魚生成
        this.fishes = [];
        this.fishSpeed = [];

        const fishTextures = [
            "./fish1.png",
            "./fish2.png",
            "./fish3.png",
            "./fish4.png"
        ];

        fishTextures.forEach((path) => {

            const fish = this.createFishParticles(path);

            this.fishes.push(fish);

            this.scene.add(fish);

        });



        this.createGlowTorii();
        this.createAudience();
        this.createStars();
        this.createBigFrame();
        // 水色 50%
        this.createAudienceLights(
            0x78dcff
        );

        // ピンク 20%
        this.createAudienceLights(
            0xff78cc
        );

        // 黄色 15%
        this.createAudienceLights(
            0xffe666
        );

        // 黄緑 15%
        this.createAudienceLights(
            0x96ff78
        );
        this.createPier();
        this.createStage();
        this.createMoon();
        //----------------------------------------------------
        // ライト
        //----------------------------------------------------
        const toriiLight = new THREE.PointLight(
            0xff6600,
            8,
            40
        );

        toriiLight.position.set(
            0,
            -5,
            -30
        );


        this.glowTorii.add(toriiLight);

        this.light = new THREE.DirectionalLight(0xffffff);

        const lvec = new THREE.Vector3(1, 1, 1).normalize();

        this.light.position.set(
            lvec.x,
            lvec.y,
            lvec.z
        );

        this.scene.add(this.light);

        //----------------------------------------------------
        // アニメーション開始
        //----------------------------------------------------

        const timer = new THREE.Timer();

        const update: FrameRequestCallback = () => {

            timer.update();

            const deltaTime = timer.getDelta();

            this.updateBubble(deltaTime);

            this.updateFish(deltaTime);

            this.updateStars(deltaTime);

            requestAnimationFrame(update);

        };

        requestAnimationFrame(update);

    };

    //----------------------------------------------------
    // 泡更新
    //----------------------------------------------------

    private updateBubble(deltaTime: number) {

        const geometry = this.cloud.geometry as THREE.BufferGeometry;
        const positions = geometry.getAttribute("position") as THREE.BufferAttribute;

        for (let i = 0; i < this.particleSpeed.length; i++) {

            if (positions.getY(i) > 100) {

                positions.setY(
                    i,
                    positions.getY(i) + this.particleSpeed[i].y - 120
                );

            } else {

                positions.setY(
                    i,
                    positions.getY(i) + this.particleSpeed[i].y * deltaTime
                );
            }
        }

        positions.needsUpdate = true;
    }


    //----------------------------------------------------
    // 桟橋
    //----------------------------------------------------

    private createPier() {

        const material = new THREE.MeshPhongMaterial({
            color: 0x8b4513 // 茶色
        });


        const geometry = new THREE.BoxGeometry(
            8,  // 横幅
            1,   // 厚み
            140   // 奥行き
        );


        const pier = new THREE.Mesh(
            geometry,
            material
        );


        // 配置
        pier.position.set(
            0,
            -15,
            20
        );


        this.scene.add(pier);

    }

    //----------------------------------------------------
    // 発光する大きな鳥居
    //----------------------------------------------------

    private createGlowTorii() {

        const material = new THREE.MeshPhongMaterial({
            color: 0xc62828,
            shininess: 80
        });

        // 左右の柱
        const pillarGeometry = new THREE.CylinderGeometry(1.5, 1.5, 30, 32);

        const leftPillar = new THREE.Mesh(pillarGeometry, material);
        leftPillar.position.set(-12, 0, -30);

        const rightPillar = new THREE.Mesh(pillarGeometry, material);
        rightPillar.position.set(12, 0, -30);

        // 横棒
        const topGeometry = new THREE.BoxGeometry(30, 2.4, 3);

        const top = new THREE.Mesh(topGeometry, material);
        top.position.set(0, 15, -30);

        // 一番上
        const roofGeometry = new THREE.BoxGeometry(36, 1.8, 3.6);

        const roof = new THREE.Mesh(roofGeometry, material);
        roof.position.set(0, 17.5, -30);

        // 真ん中
        const middleGeometry = new THREE.BoxGeometry(24, 1.2, 2.4);

        const middle = new THREE.Mesh(middleGeometry, material);
        middle.position.set(0, 7.5, -30);

        // 控柱
        const supportGeometry =
            new THREE.CylinderGeometry(
                1.0,
                1.0,
                16,
                32
            );


        // 前側控柱
        const frontLeft = new THREE.Mesh(
            supportGeometry,
            material
        );

        frontLeft.position.set(
            -12,
            -8,
            -38
        );


        const frontRight = new THREE.Mesh(
            supportGeometry,
            material
        );

        frontRight.position.set(
            12,
            -8,
            -38
        );


        // 後ろ側控柱
        const backLeft = new THREE.Mesh(
            supportGeometry,
            material
        );

        backLeft.position.set(
            -12,
            -8,
            -22
        );


        const backRight = new THREE.Mesh(
            supportGeometry,
            material
        );

        backRight.position.set(
            12,
            -8,
            -22
        );
        const sideBeamGeometry =
            new THREE.BoxGeometry(
                1.2,
                2,
                18
            );


        // 左側
        const leftBeam =
            new THREE.Mesh(
                sideBeamGeometry,
                material
            );

        leftBeam.position.set(
            -12,
            -5,
            -30
        );


        // 右側
        const rightBeam =
            new THREE.Mesh(
                sideBeamGeometry,
                material
            );

        rightBeam.position.set(
            12,
            -5,
            -30
        );


        this.glowTorii = new THREE.Group();

        this.glowTorii.add(leftPillar);
        this.glowTorii.add(rightPillar);
        this.glowTorii.add(top);
        this.glowTorii.add(roof);
        this.glowTorii.add(middle);
        this.glowTorii.add(frontLeft);
        this.glowTorii.add(frontRight);

        this.glowTorii.add(backLeft);
        this.glowTorii.add(backRight);

        this.glowTorii.add(leftBeam);
        this.glowTorii.add(rightBeam);
        this.glowTorii.translateZ(30);
        this.glowTorii.translateY(-5);
        this.scene.add(this.glowTorii);

    }

    //----------------------------------------------------
    // 円形ステージ
    //----------------------------------------------------

    private createStage() {

        const geometry = new THREE.CylinderGeometry(
            10,    // 上面の半径
            10,    // 底面の半径
            1,     // 高さ
            64     // 円の滑らかさ
        );


        const material = new THREE.MeshPhongMaterial({
            color: 0x8b4513, // 茶色
            shininess: 20
        });


        const stage = new THREE.Mesh(
            geometry,
            material
        );


        stage.position.set(
            0,
            -15,
            0
        );



        this.scene.add(stage);

    }
    //----------------------------------------------------
    // 流れる星
    //----------------------------------------------------

    private createStars() {

        const geometry = new THREE.BufferGeometry();

        const material = new THREE.PointsMaterial({

            size: 0.2,

            color: 0xffffff,

            blending: THREE.AdditiveBlending,

            transparent: true,

            depthWrite: false

        });


        const starNum = 300;

        const positions = new Float32Array(starNum * 3);

        this.starSpeed = [];


        let index = 0;


        for (let i = 0; i < starNum; i++) {

            const x = Math.random() * 120 - 42;
            const y = Math.random() * 120 - 20;
            const z = Math.random() * 160 - 80;


            positions[index++] = x;
            positions[index++] = y;
            positions[index++] = z;


            this.starSpeed.push(
                new THREE.Vector3(
                    -5,
                    -10,
                    0
                )
            );
        }


        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(
                positions,
                3
            )
        );


        this.stars = new THREE.Points(
            geometry,
            material
        );
        // トレイル作成
        const trailGeometry = new THREE.BufferGeometry();

        const trailPositions = new Float32Array(starNum * 2 * 3);

        trailGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(
                trailPositions,
                3
            )
        );


        const trailMaterial = new THREE.LineBasicMaterial({

            color: 0xffffff,

            transparent: true,

            opacity: 0.4,

            blending: THREE.AdditiveBlending

        });


        this.starTrail = new THREE.LineSegments(
            trailGeometry,
            trailMaterial
        );


        this.scene.add(this.starTrail);


        this.scene.add(this.stars);
    }

    private updateStars(deltaTime: number) {

        const positions =
            this.stars.geometry.getAttribute(
                "position"
            ) as THREE.BufferAttribute;


        for (let i = 0; i < this.starSpeed.length; i++) {

            positions.setX(
                i,
                positions.getX(i)
                +
                this.starSpeed[i].x * deltaTime
            );

            positions.setY(
                i,
                positions.getY(i)
                +
                this.starSpeed[i].y * deltaTime
            );

            positions.setZ(
                i,
                positions.getZ(i)
                +
                this.starSpeed[i].z * deltaTime
            );


            if (positions.getY(i) < -20) {

                positions.setX(
                    i,
                    Math.random() * 120 - 42
                );

                positions.setY(
                    i,
                    120 * Math.random() - 20 
                );

                positions.setZ(
                    i,
                    Math.random() * 160 - 80
                );

            }

        }
        const trailPositions =
            this.starTrail.geometry.getAttribute(
                "position"
            ) as THREE.BufferAttribute;


        for (let i = 0; i < this.starSpeed.length; i++) {

            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);


            // 星の位置
            trailPositions.setXYZ(
                i * 2,
                x,
                y,
                z
            );


            // 後ろ側
            trailPositions.setXYZ(
                i * 2 + 1,
                x - this.starSpeed[i].x * 0.8,
                y - this.starSpeed[i].y * 0.8,
                z - this.starSpeed[i].z * 0.8
            );

        }


        trailPositions.needsUpdate = true;


        positions.needsUpdate = true;

    }

    //----------------------------------------------------
    // 月
    //----------------------------------------------------

    private createMoon() {

        const geometry = new THREE.SphereGeometry(
            10,  // 月の大きさ
            64,
            64
        );


        const material = new THREE.MeshPhongMaterial({
            color: 0xffffdd,
            emissive: 0xffffaa,
            emissiveIntensity: 1.5
        });


        const moon = new THREE.Mesh(
            geometry,
            material
        );


        // 右上奥
        moon.position.set(
            80,   // 右
            70,   // 上
            -80   // 奥
        );


        this.scene.add(moon);


        // 月明かり
        const moonLight = new THREE.PointLight(
            0xffffcc,
            2,
            150
        );

        moonLight.position.copy(
            moon.position
        );


        this.scene.add(moonLight);

    }

    //----------------------------------------------------
    // 観客席
    //----------------------------------------------------

    private createAudience() {

        const geometry = new THREE.CylinderGeometry(
            100,   // 上半径
            80,   // 下半径（大きくして斜面に）
            20,   // 高さ
            128,   // 分割数
            1,
            true  // 側面のみ
        );

        const material = new THREE.MeshPhongMaterial({
            color: 0x555555,
            side: THREE.DoubleSide
        });

        const audience = new THREE.Mesh(geometry, material);

        // 魚を囲むように配置
        audience.position.set(0, -10, 10);


        this.scene.add(audience);
    }

    //----------------------------------------------------
    // 魚更新
    //----------------------------------------------------

    private updateFish(deltaTime: number) {

        this.fishes.forEach((fish, fishIndex) => {

            const geometry = fish.geometry as THREE.BufferGeometry;
            const positions = geometry.getAttribute("position") as THREE.BufferAttribute;

            const offset = fishIndex * positions.count;

            for (let i = 0; i < positions.count; i++) {

                const speedIndex = offset + i;

                if (positions.getY(i) < -20) {

                    positions.setY(
                        i,
                        positions.getY(i) + 60
                    );

                } else {

                    positions.setY(
                        i,
                        positions.getY(i) +
                        this.fishSpeed[speedIndex].y * deltaTime
                    );
                }
            }


            positions.needsUpdate = true;

            fish.rotation.y += 0.2 * deltaTime;

        });

    }
    //----------------------------------------------------
    // 全体を囲むフレーム
    //----------------------------------------------------
    private createBigFrame() {

        const boxGeometry =
            new THREE.BoxGeometry(
                200, // 横幅
                120, // 高さ
                200  // 奥行き
            );


        const edges =
            new THREE.EdgesGeometry(
                boxGeometry
            );


        const material =
            new THREE.LineBasicMaterial({

                color: 0x88eeff,

                transparent: true,

                opacity: 0.45

            });



        const frame =
            new THREE.LineSegments(
                edges,
                material
            );

        const glassMaterial =
            new THREE.MeshBasicMaterial({

                color: 0x0088aa,

                transparent: true,

                opacity: 0.05,

                side: THREE.DoubleSide,

                depthWrite: false

            });


        const glass =
            new THREE.Mesh(
                boxGeometry,
                glassMaterial
            );


        glass.position.copy(
            frame.position
        );

        glass.translateY(40);


        this.scene.add(glass);



        frame.position.set(
            0,
            40,
            0
        );


        this.scene.add(frame);

    }

}


window.addEventListener("DOMContentLoaded", init);

function init() {

    const container = new ThreeJSContainer();

    const viewport = container.createRendererDOM(
        640,
        480,
        new THREE.Vector3(-30, 0, 33)
    );

    document.body.appendChild(viewport);

}