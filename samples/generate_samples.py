import json
import base64
import io
import sys
import numpy as np
import plotly.graph_objects as go
import matplotlib.pyplot as plt

def capture_output_and_plot(code_func, last_expr_func=None):
    """
    Executes a code function, capturing stdout and the active matplotlib figure.
    Returns (stdout_lines, image_base64, last_expr_result).
    """
    # Redirect stdout
    old_stdout = sys.stdout
    redirected_stdout = io.StringIO()
    sys.stdout = redirected_stdout

    # Clear any existing matplotlib figures
    plt.close('all')

    last_expr_result = None
    try:
        # Run code function
        code_func()
        if last_expr_func:
            last_expr_result = last_expr_func()
    except Exception as e:
        print(f"Error executing code: {e}")
    finally:
        # Restore stdout
        sys.stdout = old_stdout

    stdout_text = redirected_stdout.getvalue()
    stdout_lines = [line + '\n' for line in stdout_text.splitlines()] if stdout_text else []

    # Capture figure
    img_b64 = None
    fig = plt.gcf()
    if fig.axes:
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=150, bbox_inches='tight')
        buf.seek(0)
        img_b64 = base64.b64encode(buf.read()).decode('utf-8')
        plt.close('all')

    return stdout_lines, img_b64, last_expr_result

# ----------------- NOTEBOOK 1: SIGNAL PROCESSING -----------------
def run_signal_processing_code():
    fs, T, fm, Am, fc, Ac = 2000, 0.15, 15, 0.8, 150, 1.0
    t = np.linspace(0, T, int(fs * T), endpoint=False)
    m_t = Am * np.cos(2 * np.pi * fm * t)
    am_t = (Ac + m_t) * np.cos(2 * np.pi * fc * t)
    
    plt.figure(figsize=(7.5, 2.1))
    plt.plot(t * 1000, am_t, label='AM Signal', color='#0284c7', linewidth=1.1)
    plt.plot(t * 1000, Ac + m_t, label='Envelope', color='#ef4444', linestyle='--', linewidth=1.3)
    plt.plot(t * 1000, -(Ac + m_t), color='#ef4444', linestyle='--', linewidth=1.3)
    plt.title('Amplitude Modulation Waveform', fontsize=10, fontweight='bold')
    plt.xlabel('Time (ms)'); plt.ylabel('Amplitude')
    plt.grid(True, linestyle=':', alpha=0.5); plt.legend(loc='upper right', fontsize=8)
    plt.tight_layout()
    
    print(f"Modulation indices mapped. Carrier: {fc} Hz, Modulating: {fm} Hz.")

# ----------------- NOTEBOOK 2: COMPUTER VISION -----------------
def run_computer_vision_code():
    sz, c = 128, -0.7 + 0.27015j
    xx, yy = np.meshgrid(np.linspace(-1.5, 1.5, sz), np.linspace(-1.5, 1.5, sz))
    z = xx + 1j * yy
    fractal = np.zeros(z.shape)
    for i in range(40):
        mask = np.abs(z) < 10
        z[mask] = z[mask]**2 + c
        fractal[mask] += 1
    
    def conv(x, k):
        s = k.shape[0] // 2
        p = np.pad(x, s, mode='edge')
        return np.sum([p[i:i+sz, j:j+sz] * k[i,j] for i in range(k.shape[0]) for j in range(k.shape[1])], axis=0)
    
    ax = np.arange(-2, 3)
    xx_k, yy_k = np.meshgrid(ax, ax)
    gauss = np.exp(-(xx_k**2 + yy_k**2)/(2 * 1.5**2))
    blurred = conv(fractal, gauss / np.sum(gauss))
    
    sobel_x = np.array([[-1,0,1],[-2,0,2],[-1,0,1]])
    sobel_y = np.array([[-1,-2,-1],[0,0,0],[1,2,1]])
    grad = np.sqrt(conv(blurred, sobel_x)**2 + conv(blurred, sobel_y)**2)
    
    fig, axes = plt.subplots(1, 3, figsize=(7.5, 1.25))
    for ax, img, title, cmap in zip(axes, [fractal, blurred, grad], ['Julia Set', 'Gaussian', 'Sobel Edges'], ['gray', 'gray', 'magma']):
        ax.imshow(img, cmap=cmap); ax.set_title(title, fontsize=9); ax.axis('off')
    plt.tight_layout()
    
    print(f"Fractal spaces mapped. Image dimension: {fractal.shape}")

# ----------------- NOTEBOOK 3: STATISTICS -----------------
def generate_plotly_stats_data():
    np.random.seed(42)
    n_points, rho = 500, 0.6
    x, y = np.random.multivariate_normal([0, 0], [[1.0, rho], [rho, 1.0]], n_points).T
    
    # Joint PDF
    z_term = x**2 - 2*rho*x*y + y**2
    density = (1.0 / (2 * np.pi * np.sqrt(1 - rho**2))) * np.exp(-z_term / (2 * (1 - rho**2)))
    
    fig = go.Figure(data=[go.Scatter3d(
        x=x, y=y, z=density, mode='markers',
        marker=dict(
            size=3,
            color=density,
            colorscale='Viridis',
            opacity=0.8,
            colorbar=dict(
                title=dict(
                    text='Density',
                    side='right'
                ),
                thickness=10
            )
        )
    )])
    
    fig.update_layout(
        title={
            'text': 'Bivariate Normal 3D Parameter Space',
            'y': 0.95,
            'x': 0.5,
            'xanchor': 'center',
            'yanchor': 'top'
        },
        scene=dict(
            xaxis_title='X',
            yaxis_title='Y',
            zaxis_title='f(x, y)'
        ),
        margin=dict(l=0, r=0, b=0, t=30),
        width=600,
        height=200
    )
    
    img_bytes = fig.to_image(format="png")
    img_b64 = base64.b64encode(img_bytes).decode("utf-8")
    return img_b64


# ----------------- BUILD NOTEBOOKS -----------------

def create_notebook_structure(title, desc_cells, code_source, stdout_lines, img_b64):
    cells = []
    
    for cell_type, source in desc_cells:
        cells.append({
            "cell_type": cell_type,
            "metadata": {},
            "source": [line + '\n' for line in source.strip().split('\n')]
        })
        
    outputs = []
    if stdout_lines:
        outputs.append({
            "name": "stdout",
            "output_type": "stream",
            "text": stdout_lines
        })
    if img_b64:
        outputs.append({
            "data": {
                "image/png": img_b64,
                "text/plain": [
                    "<Figure size 600x400 with 1 Axes>"
                ]
            },
            "metadata": {},
            "output_type": "display_data"
        })
        
    cells.append({
        "cell_type": "code",
        "execution_count": 1,
        "metadata": {},
        "outputs": outputs,
        "source": [line + '\n' for line in code_source.strip().split('\n')]
    })
    
    nb = {
        "cells": cells,
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3 (ipykernel)",
                "language": "python",
                "name": "python3"
            },
            "language_info": {
                "codemirror_mode": {
                    "name": "ipython",
                    "version": 3
                },
                "file_extension": ".py",
                "mimetype": "text/x-python",
                "name": "python",
                "nbconvert_exporter": "python",
                "pygments_lexer": "ipython3",
                "version": "3.11.15"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 2
    }
    return nb

# 1. Signal Processing
sp_desc = [
    ("markdown", """# Discrete Amplitude Modulation & Spectral Analysis
Given a modulating signal $m(t)$ and carrier $c(t)$:
$$m(t) = A_m \\cos(2\\pi f_m t), \\quad c(t) = A_c \\cos(2\\pi f_c t)$$
The resulting modulated wave $s(t)$ and its envelope bounds $E(t)$ are formulated as:
$$s(t) = [A_c + m(t)] \\cos(2\\pi f_c t), \\quad E(t) = \\pm [A_c + m(t)]$$""")
]

sp_code_str = """
import numpy as np
import matplotlib.pyplot as plt

# AM Signal Parameters & Waveform Generation
fs, T, fm, Am, fc, Ac = 2000, 0.15, 15, 0.8, 150, 1.0
t = np.linspace(0, T, int(fs * T), endpoint=False)
m_t = Am * np.cos(2 * np.pi * fm * t)
am_t = (Ac + m_t) * np.cos(2 * np.pi * fc * t)

# Visualize Waveform and Envelope Bounds
plt.figure(figsize=(7.5, 2.1))
plt.plot(t * 1000, am_t, label='AM Signal', color='#0284c7', linewidth=1.1)
plt.plot(t * 1000, Ac + m_t, label='Envelope', color='#ef4444', linestyle='--', linewidth=1.3)
plt.plot(t * 1000, -(Ac + m_t), color='#ef4444', linestyle='--', linewidth=1.3)
plt.title('Amplitude Modulation Waveform', fontsize=10, fontweight='bold')
plt.xlabel('Time (ms)'); plt.ylabel('Amplitude')
plt.grid(True, linestyle=':', alpha=0.5); plt.legend(loc='upper right', fontsize=8)
plt.tight_layout(); plt.show()

print(f"Modulation indices mapped. Carrier: {fc} Hz, Modulating: {fm} Hz.")
"""

print("Executing signal processing sample...")
sp_stdout, sp_img, _ = capture_output_and_plot(run_signal_processing_code)
sp_nb = create_notebook_structure("Discrete Amplitude Modulation & Spectral Analysis", sp_desc, sp_code_str, sp_stdout, sp_img)
with open("samples/signal_processing.ipynb", "w", encoding="utf-8") as f:
    json.dump(sp_nb, f, indent=1)
print("signal_processing.ipynb successfully created.")


# 2. Computer Vision
cv_desc = [
    ("markdown", """# Spatial Convolution on Julia Fractal Spaces
Applying Gaussian low-pass smoothing and Sobel boundary operators to dynamic systems: $z_{n+1} = z_n^2 + c$, $G(x, y) = \\frac{1}{2\\pi\\sigma^2} e^{-\\frac{x^2 + y^2}{2\\sigma^2}}$, and $|\\nabla I| = \\sqrt{G_x^2 + G_y^2}$.""")
]

cv_code_str = """
import numpy as np, matplotlib.pyplot as plt
sz, c = 128, -0.7 + 0.27015j
xx, yy = np.meshgrid(np.linspace(-1.5,1.5,sz), np.linspace(-1.5,1.5,sz))
z = xx + 1j * yy
fractal = np.zeros(z.shape)
for i in range(40):
    mask = np.abs(z) < 10
    z[mask] = z[mask]**2 + c
    fractal[mask] += 1
def conv(x, k):
    s = k.shape[0] // 2
    p = np.pad(x, s, mode='edge')
    return np.sum([p[i:i+sz, j:j+sz] * k[i,j] for i in range(k.shape[0]) for j in range(k.shape[1])], axis=0)
ax = np.arange(-2, 3); xx_k, yy_k = np.meshgrid(ax, ax)
gauss = np.exp(-(xx_k**2 + yy_k**2)/(2 * 1.5**2))
blurred = conv(fractal, gauss / np.sum(gauss))
sobel_x, sobel_y = np.array([[-1,0,1],[-2,0,2],[-1,0,1]]), np.array([[-1,-2,-1],[0,0,0],[1,2,1]])
grad = np.sqrt(conv(blurred, sobel_x)**2 + conv(blurred, sobel_y)**2)
fig, axes = plt.subplots(1, 3, figsize=(7.5, 1.25))
for ax, img, title, cmap in zip(axes, [fractal, blurred, grad], ['Julia Set', 'Gaussian', 'Sobel Edges'], ['gray', 'gray', 'magma']):
    ax.imshow(img, cmap=cmap); ax.set_title(title, fontsize=9); ax.axis('off')
plt.tight_layout(); plt.show()
print(f"Fractal spaces mapped. Image dimension: {fractal.shape}")
"""

print("Executing computer vision sample...")
cv_stdout, cv_img, _ = capture_output_and_plot(run_computer_vision_code)
cv_nb = create_notebook_structure("Spatial Convolution on Julia Fractal Spaces", cv_desc, cv_code_str, cv_stdout, cv_img)
with open("samples/computer_vision.ipynb", "w", encoding="utf-8") as f:
    json.dump(cv_nb, f, indent=1)
print("computer_vision.ipynb successfully created.")


# 3. Statistics
stat_desc = [
    ("markdown", """# Joint Probability Density (3D Parameter Space)
Bivariate joint normal probability distributions for correlated random variables $X$ and $Y$ governed by: $f(x, y) = \\frac{1}{2\\pi \\sigma_x \\sigma_y \\sqrt{1 - \\rho^2}} \\exp\\left( -\\frac{1}{2(1-\\rho^2)} \\left[ \\frac{x^2}{\\sigma_x^2} - \\frac{2\\rho xy}{\\sigma_x\\sigma_y} + \\frac{y^2}{\\sigma_y^2} \\right] \\right)$.""")
]

stat_code_str = """
import numpy as np, plotly.graph_objects as go

# Bivariate Normal sampling & density calculation
np.random.seed(42); n_points, rho = 500, 0.6
x, y = np.random.multivariate_normal([0, 0], [[1.0, rho], [rho, 1.0]], n_points).T
z_term = x**2 - 2*rho*x*y + y**2
density = (1.0 / (2 * np.pi * np.sqrt(1 - rho**2))) * np.exp(-z_term / (2 * (1 - rho**2)))

# 3D parameter space visualization
fig = go.Figure(data=[go.Scatter3d(
    x=x, y=y, z=density, mode='markers',
    marker=dict(size=3, color=density, colorscale='Viridis', opacity=0.8,
                colorbar=dict(title=dict(text='Density', side='right'), thickness=10))
)])
fig.update_layout(
    title='Bivariate Normal 3D Parameter Space',
    scene=dict(xaxis_title='X', yaxis_title='Y', zaxis_title='f(x,y)'),
    margin=dict(l=0, r=0, b=0, t=30), width=600, height=200
)
fig.show()

print(f"Bivariate normal space mapped. Sample size: {n_points} observations.")
"""

print("Executing statistics sample...")
stat_stdout_lines = [
    "Bivariate normal space mapped. Sample size: 500 observations.\n"
]
stat_img = generate_plotly_stats_data()

stat_nb = create_notebook_structure(
    "Joint Probability Density (3D Parameter Space)",
    stat_desc,
    stat_code_str,
    stat_stdout_lines,
    stat_img
)

with open("samples/statistics.ipynb", "w", encoding="utf-8") as f:
    json.dump(stat_nb, f, indent=1)
print("statistics.ipynb successfully created.")
