# HealthAnalyzer — Silent Myocardial Infarction (MI) Detection from 12‑Lead ECG (PTB‑XL)

> End‑to‑end pipeline to **ingest PTB‑XL ECGs**, render **4×3 clinical panels**, and train an **EfficientNet‑B0** image classifier to detect **(proxy) Silent MI** with class‑balanced training and reproducible splits.

<p align="center">
  <img alt="HealthAnalyzer banner" src="docs/hero_placeholder.png" width="75%"/>
</p>

---

## Table of Contents
- [Problem Statement](#problem-statement)
- [Team](#team)
- [Dataset](#dataset)
- [Tools & Environment](#tools--environment)
- [Methods](#methods)
- [Results](#results)
- [Future Improvements](#future-improvements)
- [Step‑by‑Step Instructions](#step-by-step-instructions)
  - [1) Setup](#1-setup)
  - [2) Download PTB‑XL](#2-download-ptb-xl)
  - [3) Prepare Labels & Renders](#3-prepare-labels--renders)
  - [4) Train](#4-train)
  - [5) Evaluate](#5-evaluate)
  - [6) Inference on New ECGs](#6-inference-on-new-ecgs)
  - [7) (Optional) Colab Workflow](#7-optional-colab-workflow)
  - [8) Export Artifacts](#8-export-artifacts)
  - [9) Troubleshooting](#9-troubleshooting)
- [Repository Structure](#repository-structure)
- [Citations](#citations)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Problem Statement
Silent myocardial infarctions (SMI) often present **without classic chest‑pain symptoms**, leading to **missed or delayed diagnosis** and poorer outcomes. This project investigates whether **deep learning on rendered 12‑lead ECG images** (from PTB‑XL) can **screen for proxy Silent MI** reliably and reproducibly using a transparent, student‑friendly pipeline that runs locally or in Colab.

**Objectives**
1. Build a **local uploads pipeline** to parse PTB‑XL ECG signals and metadata.
2. Render 12‑lead ECGs into **standard 4×3 panel images** suitable for vision models.
3. Train an image classifier (EfficientNet‑B0) with **class weighting** to address imbalance.
4. Provide **reproducible splits** (by patient group), metrics, and an easy **predict** entry point.

---

## Team

| Name | Stream | Email |
|---|---|---|
| **Katuri Sai Sahasra** | Computer Science | SaiSahasraKaturi@my.unt.edu |
| **Jayakrishna Pamuru** | Health Informatics | Jayakrishnapam123@gmail.com |
| **Priyanka Mada** | Information Science | priyankamada2001@gmail.com |
| **Yuvasri Kumar** | Data Science | yuvasrikumar163@gmail.com |
| **Preethi Dasari** | Health Informatics | PreethiDasari@my.unt.edu |

> Update roles and add more contributors if needed.

---

## Dataset
**PTB‑XL**: A large, annotated 12‑lead ECG dataset (18–20 sec recordings) from PhysioNet.  
- **Source**: https://physionet.org/content/ptb-xl/1.0.3/  
- **Files used**: `ptbxl_database.csv`, `scp_statements.csv`, ECG records under `records100/` and `records500/` (plus optional other dirs).  
- **Labels**: We derive a proxy target for MI from `scp_codes` and/or `superclass` fields in `ptbxl_database.csv`, then binarize into `{MI, non‑MI}` for a screening‑style task.

> **License & Access**: PTB‑XL requires accepting usage terms on PhysioNet. Respect patient privacy and data licensing.

---

## Tools & Environment
- **Language**: Python 3.10+
- **Core**: NumPy, Pandas, Matplotlib, tqdm
- **ML**: TensorFlow / Keras (EfficientNet‑B0), scikit‑learn
- **ECG I/O**: `wfdb` (for downloading and reading signals)
- **Utilities**: `opencv-python` / `Pillow` for image rendering
- **Hardware**: NVIDIA GPU recommended (or Google Colab)

> Optional: `conda` or `venv` for isolation; Colab notebook for quick start.

---

## Methods
1. **Signal Loading**  
   - Parse `ptbxl_database.csv` for file paths (absolute paths resolved under `DATA_ROOT/records100` and `records500`).  
   - Load raw signals with `wfdb` (or NumPy `.npy` if pre‑extracted).

2. **Label Engineering**  
   - Safe parsing of `scp_codes` → dict; map MI‑related codes; or use `superclass` list.  
   - Binary label: `MI=1`, `non‑MI=0` (proxy for Silent MI screening).  
   - Use **Group‑aware splits** (by patient ID) via `GroupShuffleSplit` to avoid leakage.

3. **Rendering 12‑Lead to 4×3 Images**  
   - Arrange leads into a clinical **4×3 panel** (e.g., I, II, III / aVR, aVL, aVF / V1–V3 / V4–V6).  
   - Normalize baseline; draw grid; anti‑alias; export **JPEG** or **PNG** at fixed size (e.g., 1024×768).

4. **Modeling**  
   - **EfficientNet‑B0** (Imagenet weights) → custom classification head.  
   - **Augmentations**: random brightness/contrast, slight scaling/translation (preserve morphology).  
   - **Class weights** to mitigate label imbalance.

5. **Training & Evaluation**  
   - Metrics: Accuracy, ROC‑AUC, Precision/Recall, Confusion Matrix.  
   - Save best model to `model_out/` and logs to `runs/` (TensorBoard optional).

6. **Inference**  
   - `predict_from_abs_npy()` or `predict_on_rendered_image()` for single‑ECG predictions.  
   - Batch inference over a folder of ECG renders.

---

## Results
> Reproduce using the steps below; add your actual numbers/screenshots.

| Split | Accuracy | ROC‑AUC | F1 (MI) | Notes |
|---|---:|---:|---:|---|
| Val | 0.87 | 0.92 | 0.84 | Group split by patient |
| Test | 0.85 | 0.90 | 0.81 | Held‑out groups |

- **Confusion Matrix**: see `reports/confusion_matrix.png`.  
- **ROC Curve**: see `reports/roc_curve.png`.  
- **Example Renders**: `samples/renders/`.  

> Include clinical error analysis (false positives/negatives) and discuss threshold selection.

---

## Future Improvements
- **Real-time Alert System:** Implement an intelligent alert mechanism that automatically notifies **nearby emergency or healthcare services** when serious or abnormal ECG patterns are detected.
- **Doctor Connectivity Module:** Add an **interactive “Consult a Doctor” button** to connect users with **nearby certified cardiologists** or healthcare professionals for instant consultation.
- **Mobile Integration:** Develop a **companion mobile app** to provide alerts, recommendations, and real-time health updates on the go.

---

## Step‑by‑Step Instructions

### 1) Setup
**Option A — Python (venv)**
```bash
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
# macOS/Linux
# source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

**Option B — Conda**
```bash
conda create -n healthanalyzer python=3.10 -y
conda activate healthanalyzer
pip install -r requirements.txt
```

**Verify your environment**
```bash
python --version
pip list | findstr /I "tensorflow wfdb opencv pandas numpy"
```

(Colab users: set Runtime → Change runtime type → **GPU**.)

---

### 2) Download PTB‑XL

**Option A — Python (recommended)**
```python
# run in a Python shell or Jupyter/Colab cell
import wfdb, os
os.makedirs("data/ptbxl_data", exist_ok=True)
wfdb.dl_database("ptb-xl", dl_dir="data/ptbxl_data")
print("✅ PTB-XL downloaded to data/ptbxl_data")
```

**Option B — Manual**
1. Visit: https://physionet.org/content/ptb-xl/1.0.3/
2. Download the full dataset (including `ptbxl_database.csv`, `scp_statements.csv`, and `records100`/`records500` folders).
3. Place everything under:
```
project_root/data/ptbxl_data/
```

---

### 3) Prepare Labels & Render 12‑Lead ECG Images
Render 4×3 clinical panels (JPEG) and create `labels.csv`:
```bash
# Windows (PowerShell): use ^ for line continuation
python tools/prepare_ptbxl.py ^
  --data_root data/ptbxl_data ^
  --out_dir data/renders ^
  --panel_width 1024 ^
  --panel_height 768 ^
  --format jpg
```
```bash
# macOS/Linux: use \ for line continuation
python tools/prepare_ptbxl.py \
  --data_root data/ptbxl_data \
  --out_dir data/renders \
  --panel_width 1024 \
  --panel_height 768 \
  --format jpg
```

**Outputs**
- `data/renders/*.jpg`  
- `data/renders/labels.csv` (includes `image_path`, `label`, `patient_id`)

---

### 4) Train the Model
```bash
# Windows
python train.py ^
  --images_dir data/renders ^
  --labels_csv data/renders/labels.csv ^
  --model_out model_out ^
  --epochs 30 ^
  --batch_size 32 ^
  --lr 1e-4 ^
  --class_weight

# macOS/Linux
python train.py \
  --images_dir data/renders \
  --labels_csv data/renders/labels.csv \
  --model_out model_out \
  --epochs 30 \
  --batch_size 32 \
  --lr 1e-4 \
  --class_weight
```

(Optional) Launch TensorBoard to view learning curves:
```bash
tensorboard --logdir runs
```

---

### 5) Evaluate
```bash
# Windows
python evaluate.py ^
  --images_dir data/renders ^
  --labels_csv data/renders/labels.csv ^
  --model_ckpt model_out/best.h5 ^
  --report_dir reports

# macOS/Linux
python evaluate.py \
  --images_dir data/renders \
  --labels_csv data/renders/labels.csv \
  --model_ckpt model_out/best.h5 \
  --report_dir reports
```

**Outputs**
- `reports/confusion_matrix.png`  
- `reports/roc_curve.png`  
- `reports/metrics.json` (accuracy, precision, recall, F1, ROC‑AUC)

---

### 6) Inference on New ECGs

**A) Batch (on a folder of renders)**
```bash
# Windows
python infer.py ^
  --model_ckpt model_out/best.h5 ^
  --input_path samples/renders ^
  --out_csv predictions.csv

# macOS/Linux
python infer.py \
  --model_ckpt model_out/best.h5 \
  --input_path samples/renders \
  --out_csv predictions.csv
```

**B) Single ECG from absolute `.npy`**
```python
from utils.predict import predict_from_abs_npy
pred = predict_from_abs_npy("C:/abs/path/to/ecg.npy", model_path="model_out/best.h5")
print(pred)  # {'prob_MI': 0.82, 'label': 1}
```

---

### 7) (Optional) Colab Workflow
```python
# 1) Mount Drive (if storing data/models on Drive)
from google.colab import drive
drive.mount('/content/drive')

# 2) Clone or upload project to /content or your Drive path
# 3) Install requirements
!pip install -r requirements.txt

# 4) Download PTB-XL with wfdb (see step 2)
# 5) Run prepare/train/evaluate commands as above (prefix shell commands with ! in Colab)
```

---

### 8) Export Artifacts
```bash
# Archive models and reports for sharing
zip -r model_and_reports.zip model_out reports
```

---

### 9) Troubleshooting

- **Windows PowerShell execution policy**:  
  If activation fails, run PowerShell as Administrator:
  ```powershell
  Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
  ```
  Then re-activate:
  ```powershell
  .\.venv\Scripts\Activate.ps1
  ```

- **`KeyError: 'scp_codes'`**:  
  Ensure you’re using the official `ptbxl_database.csv` from PTB‑XL and haven’t altered column names. Re‑download if needed.

- **`ModuleNotFoundError`**:  
  Verify install:
  ```bash
  pip install -r requirements.txt
  ```
  and that your venv is **activated**.

- **GPU not used**:  
  Install a GPU‑enabled TensorFlow per your CUDA/CuDNN stack, or use **Colab GPU**.

---

## Repository Structure
```text
.
├── data/
│   ├── ptbxl_data/              # Raw PTB‑XL (downloaded)
│   └── renders/                 # Rendered 4×3 ECG images + labels.csv
├── docs/                        # Pics/diagrams (placeholders)
├── model_out/                   # Saved models & checkpoints
├── notebooks/
│   └── healthanalyzer_colab.ipynb
├── reports/                     # Metrics, curves, confusion matrix
├── samples/                     # Example inputs/outputs
├── src/                         # Library code
│   ├── dataio/                  # Loading PTB‑XL, safe parsing
│   ├── rendering/               # 4×3 panel generation
│   ├── models/                  # EfficientNetB0 head, compile utils
│   └── utils/                   # predict_from_abs_npy, metrics, etc.
├── tools/
│   └── prepare_ptbxl.py         # Preprocess + render CLI
├── train.py
├── evaluate.py
├── infer.py
├── requirements.txt
└── README.md
```

---

## Citations
- Wagner, P. et al. **PTB‑XL, a large publicly available electrocardiography dataset.** Sci Data 7, 154 (2020). https://doi.org/10.1038/s41597-020-0495-6  
- Tan, M. & Le, Q. **EfficientNet: Rethinking Model Scaling for CNNs.** ICML 2019.

> Please cite PTB‑XL and follow PhysioNet’s data‑use policies when publishing results.

---

---

## Acknowledgements
- PhysioNet team for PTB‑XL.
- Open‑source contributors for TensorFlow/Keras and EfficientNet.
- Course mentors and reviewers for feedback on experimental design.
