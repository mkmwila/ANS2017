import numpy as np
import matplotlib.pyplot as plt
import timeit
import time

def PlaneMotionModel(d,V,**kwargs):

    # Operations to be performed every time the Reflective driver performs a check

    # input parameter d, the wheel steer angle in rad
    # input parameter V, the vehicle speed in m/s

    start = timeit.default_timer()
    safety = 0
    while safety == 0:
        if V < 2.7:
            safety = 1
            Vnew = V
            break
        BC1 = 2*(Kf+Kr)/(m*V)
        BC2 = 1+(2*((lf*Kf)-(lr*Kr))/(m*V*V))
        BC3 = (2*Kf*d)/(m*V)
        rC2 = 2*((lf*lf*Kf)+(lr*lr*Kr))/(I*V)
        rC3 = 2*lf*Kf*d/I
        Bvec = np.zeros([n,1])
        rvec = np.zeros([n,1])
        t = np.linspace(h,tspan,n)
        B = 0 # get this value from Correvit
        r = 0 # get this value from IMU
        Bmax = 0
        Bmin = 999
        Vnew = V
        print(Vnew)
        for x in range(0,n):    # Determine slip angles and yaw rate for V and d input
            kB1 = (-BC1*B)-(BC2*r)+BC3
            kr1 = (-rC1*B)-(rC2*r)+rC3
            kB2 = (-BC1*(B+(h2*kB1)))-(BC2*(r+(h2*kr1)))+BC3
            kr2 = (-rC1*(B+(h2*kB1)))-(rC2*(r+(h2*kr1)))+rC3
            kB3 = (-BC1*(B+(h2*kB2)))-(BC2*(r+(h2*kr2)))+BC3
            kr3 = (-rC1*(B+(h2*kB2)))-(rC2*(r+(h2*kr2)))+rC3
            kB4 = (-BC1*(B+(h*kB3)))-(BC2*(r+(h*kr3)))+BC3
            kr4 = (-rC1*(B+(h*kB3)))-(rC2*(r+(h*kr3)))+rC3
            Bvec[x] = B + (h6*(kB1+(2*kB2)+(2*kB3)+kB4))
            rvec[x] = r + (h6*(kr1+(2*kr2)+(2*kr3)+kr4))
            B = Bvec[x]
            r = rvec[x]
            if B > Bmax:
                Bmax = B
            if B < Bmin:
                Bmin = B
        print("OUTER Loop. Bmax: ", Bmax, "    Bmin: ", Bmin, "    Blimit: ", Blimit)
        if (Bmax < Blimit) and (Bmin > -Blimit):     # Check safety (slip limit)
            safety = 1
            print("Blimits safety check: ", safety)
            break
        while safety == 0:   # If unsafe, reduce speed, predict slip, check for safety, repeat until suitable speed found
            Vnew = 0.75*Vnew
            print("Updated Speed: ", Vnew)
            if Vnew < 2.7:
                safety = 1
                print("Speed safety check: ", safety)
                break
            else:
                BC1 = 2 * (Kf+Kr)/(m*Vnew)
                BC2 = 1 + (2*((lf*Kf)-(lr*Kr))/(m*Vnew*Vnew))
                BC3 = (2*Kf*d)/(m*Vnew)
                rC2 = 2 * ((lf*lf*Kf)+(lr*lr*Kr))/(I*Vnew)
                Bvec = np.zeros([n, 1])
                rvec = np.zeros([n, 1])
                t = np.linspace(h, tspan, n)
                B = 0
                r = 0
                Bmax = 0
                Bmin = 999
                for x in range(0, n):   # Predict slip angle and yaw rate for d and new V
                    kB1 = (-BC1*B)-(BC2*r)+BC3
                    kr1 = (-rC1*B)-(rC2*r)+rC3
                    kB2 = (-BC1*(B+(h2*kB1)))-(BC2*(r+(h2*kr1)))+BC3
                    kr2 = (-rC1 * (B + (h2 * kB1))) - (rC2 * (r + (h2 * kr1))) + rC3
                    kB3 = (-BC1 * (B + (h2 * kB2))) - (BC2 * (r + (h2 * kr2))) + BC3
                    kr3 = (-rC1 * (B + (h2 * kB2))) - (rC2 * (r + (h2 * kr2))) + rC3
                    kB4 = (-BC1 * (B + (h * kB3))) - (BC2 * (r + (h * kr3))) + BC3
                    kr4 = (-rC1 * (B + (h * kB3))) - (rC2 * (r + (h * kr3))) + rC3
                    Bvec[x] = B + (h6 * (kB1 + (2 * kB2) + (2 * kB3) + kB4))
                    rvec[x] = r + (h6 * (kr1 + (2 * kr2) + (2 * kr3) + kr4))
                    B = Bvec[x]
                    r = rvec[x]
                    if B > Bmax:
                        Bmax = B
                    if B < Bmin:
                        Bmin = B
                print("INNER Loop. Bmax: ", Bmax, "    Bmin: ", Bmin, "    Blimit: ", Blimit)
                if (Bmax < Blimit) and (Bmin > -Blimit):
                    safety = 1
                    print("Blimits safety check: ", safety)
    # rvec = rvec*(180/(np.pi))
    # Bvec = Bvec* (180/(np.pi))
    # plt.plot(t,rvec)
    # plt.show()
    # plt.plot(t,Bvec)
    # plt.show()
    stop = timeit.default_timer()
    print("Solve Time: ", stop-start)
    return Vnew

if __name__ == "__main__":

    # Parameters to be saved to memory
    m = 2210
    I = 2652
    lf = 1.098
    lr = 1.282
    Kf = 123.759e3
    Kr = 123.759e3
    Blimitdeg = 0.6
    Blimit = Blimitdeg*(np.pi)/180
    # time.sleep(2)
    tspan = 5
    h = 0.025
    n = int(tspan/h)
    h6 = h/6
    h2 = h/2
    rC1 = 2*((lf*Kf)-(lr*Kr))/I

    # Every time a speed and steer command is issued the reflective driver performs a check
    # d and V is command input
    Vkmh = 20
    ddeg = 1
    d = ddeg*(np.pi)/180    # dummy value [rad]
    V = Vkmh*1000/(60*60)   # dummy value [m/s]

    # PlaneMotionModel function = reflective driver
    Vchanged = PlaneMotionModel(d, V, m=m, I=I, lf=lf, lr=lr, Kf=Kf, Kr=Kr, Blimit=Blimit, tspan=tspan, n=n, h=h, h6=h6, h2=h2, rC1=rC1)
    print("Changed speed:", Vchanged)

